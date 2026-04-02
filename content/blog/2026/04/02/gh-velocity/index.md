---
title: "gh-velocity: flow metrics for work in GitHub"
date: 2026-04-02T11:29:15-06:00
tags: [github, cli, metrics, velocity, lean]
toc: true
series: []
summary: |-
  I built a GitHub CLI extension for engineering flow metrics. Here's
  the philosophy behind it, and two stories about what went wrong.
draft: false
images: [shelly.png]
---

{{< figure src="shelly.png" w="400" title="Shelly, the gh-velocity mascot" >}}

I've spent most of my career as a leader inside technical organizations thinking about how teams ship software. Not just whether they ship, but how smoothly work flows from idea to production and what gets in the way. I care about operational efficiency, and I think the best way to improve it is through data and insights, not gut feel.

[gh-velocity](https://gh-velocity.org) is a GitHub CLI extension I built to scratch that itch. The elevator pitch: run `gh velocity` against any GitHub repo and get flow metrics (lead time, cycle time, throughput, WIP) plus quality breakdowns and actionable insights, all from your existing issues, PRs, and releases. No external services, no setup beyond a single config command.

This post isn't a tutorial. The tool exists, the [docs](https://gh-velocity.org) exist. I want to talk about *why* I built it the way I did, and two stories about what went wrong.

## So what?

"So what?" is a question I ask my teams constantly. Not to be dismissive, but to get to the *reasoning* that follows data.

A dashboard that says your median lead time is 21 days tells you almost nothing. So what? What are you going to *do* about it? Here's what gh-velocity says instead:

```
Lead Time:
→ 5 items took 8x longer than the median (4d 12h).
→ Moderate delivery time variability (CV 0.8) — some items
  take significantly longer than others.
```

That's from a [real showcase run](https://github.com/dvhthomas/gh-velocity/discussions/168) against the GitHub CLI repo. Not "your median is X" but "5 items are 8x slower, here's the variability." You can actually do something with that.

The metrics themselves aren't new. Lead time, cycle time, throughput, work in progress: these have deep roots in [Lean manufacturing](https://en.wikipedia.org/wiki/Lean_manufacturing) and have been adapted for software delivery over the past two decades. The math has been figured out for a long time. What's usually missing is the "so what?"

### Howie and the gap that stuck with me

At GitHub I worked with an internal system called Howie (short for "How We Work"). Howie enforced basic agreements about how we worked: an Epic was 2-6 weeks of work, that kind of thing. Shared vocabulary. That let us start analyzing information in ways we couldn't before.

Howie also did a ton of reporting: HTML comments wrapped around structured data, posted to tracking issues. But it never really got to standard flow metrics beyond WIP. That gap always bugged me.

gh-velocity is my attempt to close it. Howie's report format directly inspired how gh-velocity [posts its own results](https://gh-velocity.org/guides/posting-reports/) to GitHub discussions. Reports get wrapped in HTML comments like `<!-- gh-velocity:report:7d -->` so the tool can find and update its own content without clobbering anything else in the discussion. Here's [a real example](https://github.com/CalcMark/go-calcmark/discussions/103) of what that looks like in practice.

### Not DORA, and that's deliberate

gh-velocity doesn't try to measure [DORA metrics](https://dora.dev/guides/dora-metrics-four-keys/). DORA metrics (deployment frequency, change failure rate, mean time to recovery) need systems of record that GitHub doesn't provide. You need your CI/CD pipeline, your incident tracker, your deployment logs.

Flow metrics and DORA are complementary, but they answer different questions. gh-velocity stays in the flow lane because that's what GitHub data can actually support well.

### Gamification is real

These metrics can absolutely be gamed. Close issues faster by splitting them into trivial pieces. Reduce lead time by not filing issues until you've already fixed them.

The antidote isn't picking "ungameable" metrics (those don't exist). The antidote is *insights* rather than *numbers*. Here's what I mean:

A typical dashboard: `Bug rate: 40%`

gh-velocity:
```
40% of closed issues are bugs (above configured 20% threshold).
Bug fixes (median 19d 3h) faster than other work (median 29d 1h).
7 of 21 bugs (33%) were hotfixed within 72h.
Hotfixes account for 13% of all work — consider investing in prevention.
```

That last line, "consider investing in prevention," is the tool doing its job. It's not just reporting a number, it's suggesting what to do about it.

## The tool itself

### The easy button

Configuration is usually the barrier. You install a metrics tool, stare at a config file, and realize you don't actually know what labels your repo uses or how your team tracks work.

[`gh velocity config preflight`](https://gh-velocity.org/getting-started/configuration/) solves this. Run it against any repo and it inspects your labels, your Projects v2 boards, your recent PRs and issues:

```
Analyzing dvhthomas/gh-velocity...

  Labels found      12 (bug, enhancement, in-progress, ...)
  Issue types       bug, feature (native GitHub Issue Types)
  Project board     users/dvhthomas/projects/1
  Lifecycle labels  in-progress, in-review, done
  Noise labels      duplicate, invalid (auto-excluded)

Wrote .gh-velocity.yml
```

The generated config includes match evidence, proof that each matcher actually catches real issues:

```
# bug / label:bug — 33 matches, e.g. #12893 error parsing "input[title]"...
# feature / label:enhancement — 37 matches, e.g. #12862 Remove a book...
# chore / label:tech-debt — 0 matches (review this matcher)
```

Matchers with 20+ matches are solid. Zero-match matchers get flagged. For the [Kubernetes showcase](https://github.com/dvhthomas/gh-velocity/discussions/168), preflight auto-detected sizing labels and generated Fibonacci effort weights:

```yaml
effort:
  strategy: attribute
  attribute:
    - query: "label:size/XS"
      value: 1
    - query: "label:size/S"
      value: 2
    - query: "label:size/M"
      value: 3
    - query: "label:size/L"
      value: 5
    - query: "label:size/XL"
      value: 8
```

You run one command and get a config that provides value on the first real run.

### My week

The command I use most is [`gh velocity my-week`](https://gh-velocity.org/commands/my-week/). It's a personal summary: what did I ship, what's waiting on me, how fast did things move?

```
My Week — dvhthomas (dvhthomas/gh-velocity)
  2026-03-14 to 2026-03-21

── Insights ────────────────────────────────

  Shipped 10 items (4 issues closed, 6 PRs merged) in 7 days.
  Reviewed 3 PRs.
  2 of 6 PRs were AI-assisted (33%).
  Median lead time: 2d 4h, p90: 11d (issue created → closed).
  WAITING: 1 stale issue(s) (7+ days idle).

── What I shipped ──────────────────────────

Issues Closed: 4
  #152  2026-03-18  feat: add --title flag to override discussion title
  #148  2026-03-17  fix: show bug emoji for type-based matches
  #145  2026-03-15  feat: add discussions.title config
  #140  2026-03-14  feat: enrich REST issues with IssueType via GraphQL

── Waiting on ──────────────────────────────

Stale Issues: 1
  #38  Investigate cross-invocation cache  (no update in 14d)
```

Notice [issue #38](https://github.com/dvhthomas/gh-velocity/issues/38) in the "waiting on" section: that had been sitting idle for two weeks, and `my-week` is what surfaced it.

### Insights that prompt action

Here's what a full [showcase run](https://github.com/dvhthomas/gh-velocity/discussions/168) against the GitHub CLI looks like:

```
Report: cli/cli (2026-02-19 – 2026-03-21 UTC)

  Lead Time:   median 4d 12h, P90 18d, predictability: moderate (n=47)
  Cycle Time:  median 1d 8h, P90 6d, predictability: moderate (n=39)
  Throughput:  47 issues closed, 62 PRs merged
  WIP:         23 items (4 stale)
```

The summary numbers are useful enough, but look at the insights:

```
→ 62 PRs merged but 47 issues closed — PRs may not be linked to issues.
→ Lead Time ranges from 2m to 5y 60d — investigate #2722 for bottlenecks.
→ 72% of WIP is in review — potential review bottleneck.
```

That WIP insight, "72% of WIP is in review," is a real finding. It tells you *where* work is stuck, not just *that* it's stuck. And the tool points directly to [cli/cli#2722](https://github.com/cli/cli/issues/2722) as the longest-open item.

## What went wrong

I learned some hard lessons building this thing.

### The @-mention disaster

I set up a [nightly GitHub Actions workflow](https://github.com/dvhthomas/gh-velocity/blob/main/.github/workflows/velocity.yaml) that ran gh-velocity against a bunch of open source repos and posted the results as [GitHub Discussion posts](https://github.com/dvhthomas/gh-velocity/discussions/categories/velocity-showcase). A [showcase](https://github.com/dvhthomas/gh-velocity/discussions/168). Kubernetes, React, the GitHub CLI, and several others.

The reports contained `@handles` for contributors. GitHub rendered those as live mentions, sending real notifications to real maintainers every single night. I was so excited about the showcase working that I completely missed this.

An open source maintainer reached out publicly:

> "You are annoying maintainers with these notifications. Please stop."

They were right. I was the one who screwed up.

The showcase started with [10 external repos](https://github.com/dvhthomas/gh-velocity/discussions/151). I trimmed it to 7. Then I [fixed the actual problems](https://github.com/dvhthomas/gh-velocity/pull/176) and trimmed it to 2 (just my own projects).

The [fix](https://github.com/dvhthomas/gh-velocity/commit/fd570628) was embarrassingly simple: wrap all `@handles` in backticks so they render as `code` instead of triggering mentions. A change across [5 output files](https://github.com/dvhthomas/gh-velocity/pull/176/files) that should have been there from day one. The second fix: making dry-run the default. The tool now requires `GH_VELOCITY_POST_LIVE=true` to actually post anything.

If your tool interacts with shared spaces (discussions, issues, PR comments), the default behavior should be *silence*. Make people opt in to making noise, not opt out.

I built a tool around the philosophy that metrics without insight are noise, and then I created literal noise---unwanted notifications---because I wasn't thoughtful about my own tool's defaults.

### The rate limiting complexity spiral

The goal was simple: analyze GitHub data. Run some search queries, count some issues, compute some stats.

The [GitHub Search API](https://docs.github.com/en/rest/search) allows 30 requests per minute. Fine, add a delay. Then I hit the secondary rate limit, an [undocumented abuse detection system](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api#about-secondary-rate-limits) that triggers on burst patterns *even under the primary limit*. Lockouts of 1-5 minutes, thresholds unpublished.

Each layer of defense created the next problem:

| Layer | Problem | Solution |
|-------|---------|----------|
| Primary limit | 30 req/min cap | Add delays between calls |
| Secondary limit | Undocumented burst detection, 1-5 min lockouts | [`api_throttle_seconds: 2`](https://gh-velocity.org/reference/api-consumption/) --- mutex serializes all search calls |
| Throttle cost | 2-second gaps make repeated calls painful | Disk cache (5 min TTL) + [in-memory singleflight](https://gh-velocity.org/reference/api-consumption/#caching) dedup |
| Result cap | 1,000 results max per query | Query decomposition by date range |
| API asymmetry | REST (30/min) vs GraphQL (5,000 pts/hr) | [Different strategies per command](https://gh-velocity.org/reference/api-consumption/#per-command-costs) --- board-based uses GraphQL (3-5 calls), search-based uses REST (7-70 calls) |

I didn't plan five layers of rate limiting defense. I added them one at a time, each time something broke. The mutex came after the first abuse lockout. The cache came after the throttle made development painful. The query decomposition came after a [Kubernetes analysis](https://github.com/dvhthomas/gh-velocity/discussions/168) silently truncated at 1,000 issues.

The [API consumption docs](https://gh-velocity.org/reference/api-consumption/) exist because I hit every one of these walls. I get why most teams just buy a dashboard product.

---

gh-velocity is open source at [dvhthomas/gh-velocity](https://github.com/dvhthomas/gh-velocity). The [docs](https://gh-velocity.org) cover installation, configuration, and every command. If you try [`gh velocity config preflight`](https://gh-velocity.org/getting-started/configuration/) and it generates something useful, I'd like to hear about it.
