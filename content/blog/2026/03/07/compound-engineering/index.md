---
title: Compound engineering
date: 2026-03-07T09:52:58-07:00
tags: [ai, learning, knowledge, velocity, quality]
toc: true
series: []
summary: |-
  How I used compound engineering to build a real product as a solo developer.
  Not "look how many commits I made" but "look at the quality and speed of
  issue resolution." The data tells the story.
draft: false
images: [calcmark-og.png]
---

{{< figure src="calcmark-og.png" title="CalcMark — calculations embedded in markdown" >}}

I've been building [CalcMark](https://calcmark.org)---a terminal-based calculation notepad written in Go---as a solo developer since November 2025.
Four months later I have a real product: 23 releases, a Homebrew tap, multi-platform binaries, a TUI editor with live preview, undo/redo, GitHub Gist sharing, theming, and a whole lot more.

I did not write most of the code. Claude did.
But I directed every bit of it, and the quality is genuinely good.

This post is about the *how*---specifically a workflow called **compound engineering** that made this possible. Habits first, then the data that backs them up.

## What is compound engineering?

I learned about [compound engineering](https://every.to/chain-of-thought/compound-engineering-how-every-codes-with-agents) from Dan Shipper and Kieran Klaassen at [Every](https://every.to).
The core insight is deceptively simple: each unit of engineering work should make the *next* unit easier.

The workflow has four steps:

1. **Plan**---Research the codebase, the problem, and the approach. Write it down.
2. **Work**---Execute the plan. The agent writes the code, runs the tests, makes the commits.
3. **Review**---Specialized review agents check the work from multiple angles.
4. **Compound**---Capture what you learned. Bugs, gotchas, architectural decisions go into solution documents that the agent reads in future sessions.

That fourth step is what makes it *compound*. The agent gets smarter about *your* codebase over time.

## How I got here

I want to be honest about this part, because the "here's my polished workflow" version skips the months of flailing that came first.

Before I had any structure, working with Claude was chaos. I'd start a session, ask it to fix a bug, and twenty minutes later it had rewritten half the codebase. I lacked branch discipline---I was working on `main`, the agent was working on `main`, and merges were a disaster. I'd lose track of what I'd asked it to do versus what it had decided to do on its own. **The codebase was a mess. My emotional state was just as messy.**

I distinctly remember yelling at my terminal: *"Why are you doing this again?! I just told you to validate with a test and then make it work, not rip the entire codebase apart!"* More than once. The agent would see something that looked wrong, "fix" it, break three other things, then try to fix *those*, and before I knew it I was staring at a 40-file diff that I couldn't make sense of. I'd `git reset --hard` and start over, furious.

The problem wasn't Claude. The problem was me. I didn't have a system. Vague instructions, no scope constraints, no tests-first rule, no record of what we'd already tried. Every session started from zero.

That's when I found the [Get Sh\*t Done](https://github.com/gsd-build/get-shit-done) npm plugin for Claude Code---I think via a [Pointer](https://pointer.io) email about engineering leadership. GSD gave me the structure I was missing: spec-driven, phase-based workflow that breaks work into milestones, plans, and tasks. Each plan executes in a fresh sub-agent context, preventing what they call "context rot." The [`.planning/` directory](https://github.com/calcmark/go-calcmark/tree/main/.planning) in the CalcMark repo shows GSD's fingerprints everywhere. The v1.0 milestone shipped with 8 phases, 21 plans, and 94 commits.

But I moved on from GSD. The npm installation was a little rough, and honestly, having "Get Sh*t Done" sprinkled through my terminal output got old fast. I don't need profanity in my toolchain.

I switched to the [Compound Engineering plugin](https://github.com/EveryInc/compound-engineering-plugin) which installs natively as a Claude Code plugin. Smoother setup, and it brought the review and compounding steps that GSD didn't emphasize as much.

## Habits that work

### Specs aren't waterfall, they're agile at speed

Plans? Specs? Research phases? That sounds like waterfall.

But when I look at what actually happened on a day like March 3rd---three bugs filed, three plans written, three fixes shipped with tests, all in a few hours[^concurrent]---that's not waterfall. The plans exist for minutes, not months. Write a plan, execute it, throw it away. The spec just makes sure the agent and I agree on what "done" means before it starts writing code.

After months of flailing, responding to GSD's thoughtful, directed questions was like drinking a glass of water in a desert. Finally something was asking me questions I hadn't thought of but definitely needed to decide. *"Why a REPL? Why not just a TUI?"* Uh...right. *"Are locales important?"* Oh. *"Does this really need to support a web client?"* I...uh...guess not. Those questions saved me weeks of building the wrong thing.

[Thoughtworks](https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices) and the [AIUP framework](https://martinelli.ch/why-spec-driven-development-can-be-iterative-incremental-and-agile/) have made this argument more formally---spec-driven development iterates on *understanding* rather than code. When I catch a misunderstanding in the plan, I fix three sentences of markdown. When I catch it in the code, I'm debugging for an hour.

### Prove the bug first, then fix it

This is the single most impactful rule in my [`AGENTS.md`](https://github.com/calcmark/go-calcmark/blob/main/AGENTS.md):

> "You MUST ALWAYS write a unit or integration test to describe expected behavior"
> "You MUST NEVER attempt to fix a bug or implement a CalcMark language or cm TUI feature without first verifying the bug by running `task test`"

Without this, agents jump in and "fix" things---which just breaks more stuff. Claude sees something that looks wrong, changes it, introduces a regression in code that was actually fine. Requiring a failing test *first* forces the agent to prove the bug exists before touching anything.

228 test files across 406 Go source files (56% test-to-source ratio), plus 182 golden test data files for grammar, semantics, and runtime behavior.

### Architecture reviews as a quality gate

I wrote a [`/review-architecture`](https://github.com/calcmark/go-calcmark/blob/main/.claude/commands/review-architecture.md) slash command that audits the codebase across 10 architectural principles: dependency direction, interface segregation, state management, code scale, dead code, error handling, and more. Findings are prioritized P0 (critical) through P2 (minor) with a scored health matrix out of 30. It's like having a senior engineer do a codebase audit on demand.

On March 6th I ran it and got 8 findings. I addressed every one in [a single commit](https://github.com/calcmark/go-calcmark/commit/bbef5a0):

```
fix: architecture review — Ctrl+C save prompt, dead state cleanup, code hygiene

- P1-01: Ctrl+C without selection now routes through executeCommandByName("Quit")
  so unsaved changes prompt is shown (was bypassing save prompt)
- P1-02: Remove all TODO/FIXME markers (11 -> 0)
- P1-03: Remove unused AlignedModel cache (3 fields, computeCacheKey,
  InvalidateAlignedCache)---cache was invalidated every keypress
- P2-01: Remove dead lineWrap field (declared, never read)
- P2-02: Extract autocomplete handler from model.go (1119 -> 775 lines)
- P2-03: Add command name consistency test to catch string dispatch typos
- P2-04: Add "New" command to help overlay for discoverability
- P2-05: Surface swallowed errors in newFile() and transitionToReady()
```

19 files, 390 additions, 461 deletions. P1-01 was a real bug: Ctrl+C was *bypassing* the unsaved changes prompt. I would not have found that manually.

### Compound knowledge is the entire point

The [`docs/solutions/`](https://github.com/calcmark/go-calcmark/tree/main/docs/solutions) directory has 28 solution documents across 7 categories: UI bugs, logic errors, build errors, code organization, infrastructure, integration issues, and test failures. Each follows a consistent structure:

```yaml
---
title: "Go closure value-type capture bug"
date: 2026-02-08
severity: high
components: [tui, editor]
tags: [go, closures, value-types]
root_cause: "closure capturing loop variable by reference"
---
```

Then: Problem, Root Cause, Solution, Verification, Prevention Strategies.

Here's a concrete example. I hit a bug where the TUI autocomplete was silently showing stale results. The root cause was a Go value-type gotcha: closures capturing a local `Model` variable that gets copied on return, leaving the closure referencing stale state. No panics---just wrong behavior.

The [solution doc](https://github.com/CalcMark/go-calcmark/blob/main/docs/solutions/logic-errors/go-closure-capturing-stale-value-type.md) (added in [commit `3b7368d`](https://github.com/calcmark/go-calcmark/commit/3b7368d)) added a prevention strategy:

> *"For every closure in a `New()` function, verify what it captures. Flag any captures of the local `Model` variable."*

Two days later, during the [architecture review](https://github.com/calcmark/go-calcmark/commit/bbef5a0), Claude applied the same lesson: finding P1-03 identified an `AlignedModel` cache with identical value-type copy semantics. Dead code that *looked* correct, caught because the agent had read the solution doc and recognized the pattern.

That's compounding. The system got smarter because I spent 5 minutes documenting a bug fix.

**Memory matters more than speed.** Speed without memory is just churn. The agent has no long-term memory by default; the `docs/solutions/` directory *is* the memory. Other people are landing on the same idea---Anthropic's [best practices](https://code.claude.com/docs/en/best-practices) treat `CLAUDE.md` as long-term agent memory, and Thomas Dohmke's [Entire](https://entire.io) captures full agent sessions alongside git commits.

## Examples in real life

### The alignment problem: compounding in action

CalcMark has a side-by-side TUI: source pane on the left, preview pane with calculated results on the right.

{{< figure src="calcmark-hero.gif" title="CalcMark's side-by-side TUI — source on the left, live results on the right" >}}

Keeping those two panes vertically aligned turned out to be one of the hardest problems in the whole project.

It wasn't one bug. It was a *class* of bugs that kept resurfacing---[6 distinct incidents](https://github.com/calcmark/go-calcmark/tree/main/docs/solutions/ui-bugs) over two weeks, producing 22 commits, 8 solution docs, 3 brainstorm docs, and 4 plan docs.

The pane divider wasn't rendering. Then ANSI codes bled through during compositing. Then frontmatter lines shifted the preview pane because the code checked cursor position *before* checking if the line was frontmatter. Then the formatters used the wrong index because blank source lines don't produce results but the loop counter didn't know that. The [solution doc](https://github.com/calcmark/go-calcmark/blob/main/docs/solutions/ui-bugs/context-footer-statement-index-drift.md) for that one noted: *"This is the 4th instance of statement index drift in go-calcmark."*

Fourth time.

Each fix got captured as a solution doc with a prevention strategy:

- Check structural properties before transient UI state
- Never parse composed `View()` output by splitting on pipe characters
- Source lines and results must use independent indices
- Trace guard clause control flow---a loop that *looks* correct can be a no-op

By the sixth incident, the agent wasn't starting from zero. It knew the patterns from prior solution docs. Eventually the accumulated knowledge pointed toward a centralized [`AlignResults`](https://github.com/calcmark/go-calcmark/commit/fd1ee3f) function that made the source-to-result mapping explicit and testable in isolation. That refactoring didn't come from a brilliant design session. It emerged from 6 rounds of debugging, each one documented, each one faster than the last.

### Documentation that writes (and verifies) itself

The [calcmark.org](https://calcmark.org) documentation would be crap if I'd had to maintain it by hand. Too many moving parts---CLI commands, supported units, function signatures, worked examples---and they change with every release.

I wrote a [`document-refresh` skill](https://github.com/calcmark/go-calcmark/tree/main/.claude/skills/document-refresh) that audits every documentation surface against the spec registry (`spec/features/registry.go`) as a single source of truth.

The key insight: **code-driven documentation is less brittle than manually curated docs**. The site has a build pipeline (`cmd/docgen` generates a features table, `cmd/doceval` evaluates every CalcMark code block and writes results to JSON, Hugo renders it all) so that if a function signature changes, the *build breaks*. You can't ship wrong docs because CI catches them.

I didn't design that pipeline up front. It emerged from solution docs about documentation drift---after the third time I caught stale output on a doc page, I wrote a solution doc, Claude read it, and together we built `doceval` to make the problem structurally impossible.

## The evidence

My data isn't clean. I didn't start with a measurement strategy---I started building, and the data is a byproduct of emerging discipline around GitHub issues and releases. The timestamps are real though, and the patterns tell a story. With more discipline---consistent issue labeling, draft PRs opened when work starts---this data gets much cleaner. The compound engineering workflow nudges you in that direction because each phase creates measurable artifacts.

### Issue lead time

Lead time is the clock time from issue *created* to *closed*. This is the metric I trust most---hard to game, easy to extract.

{{% code file="issue-lead-time.sh" lang="sh" %}}

Here's go-calcmark:

| Issue | Title | Lead time |
|-------|-------|-----------|
| [#8](https://github.com/calcmark/go-calcmark/issues/8) | Multiplication of derived Rate fails | 18 min |
| [#5](https://github.com/calcmark/go-calcmark/issues/5) | CM should fail on invalid file types | 24 min |
| [#31](https://github.com/calcmark/go-calcmark/issues/31) | `ms` not a short unit for millisecond | 42 min |
| [#30](https://github.com/calcmark/go-calcmark/issues/30) | Missing autosuggest help | 42 min |
| [#23](https://github.com/calcmark/go-calcmark/issues/23) | IO broken on piped evaluation | 52 min |
| [#27](https://github.com/calcmark/go-calcmark/issues/27) | Make examples linkable on the site | 1.0 hr |
| [#33](https://github.com/calcmark/go-calcmark/issues/33) | CommonMark/GFM coverage in docs | 1.2 hr |
| [#14](https://github.com/calcmark/go-calcmark/issues/14) | Space between number and kg unit | 1.3 hr |
| [#16](https://github.com/calcmark/go-calcmark/issues/16) | Adding number to currency fails | 1.4 hr |
| [#15](https://github.com/calcmark/go-calcmark/issues/15) | Autosuggest text not in edit stack | 2.0 hr |
| [#26](https://github.com/calcmark/go-calcmark/issues/26) | Wrapped text in Preview Pane loses styling | 3.1 hr |
| [#12](https://github.com/calcmark/go-calcmark/issues/12) | Multi-byte character support | 4.3 hr |
| [#21](https://github.com/calcmark/go-calcmark/issues/21) | Support `as`/`in` duration conversion | 16.1 hr |
| [#10](https://github.com/calcmark/go-calcmark/issues/10) | Status line showing wrong value | 18.2 hr |
| [#11](https://github.com/calcmark/go-calcmark/issues/11) | More complete JSON output | 21.3 hr |

{{< vega id="lead-time" spec="issue-lead-time-chart.json" >}}

| Stat | Value |
|------|-------|
| N | 15 issues |
| Median | 1.3 hours |
| Mean | 4.9 hours |
| SD | 7.2 hours |

Most issues close in under 2 hours. The high SD comes from a few outliers (duration conversion, JSON output) that pull the average up. [Generate this chart](issue-lead-time-vega.sh) and [summary stats](issue-lead-time-summary.sh) for your own repo.

### PR cycle time

PR cycle time---created to merged---is trickier for a solo developer. If your team opens draft PRs when work starts, it's a decent velocity proxy.

{{% code file="pr-cycle-time-summary.sh" lang="sh" %}}

{{< vega id="cycle-time" spec="pr-cycle-time-chart.json" >}}

| Stat | Value |
|------|-------|
| N | 16 PRs |
| Median | 1.5 minutes |
| Mean | 3.1 minutes |
| SD | 4.9 minutes |

[Generate this chart](pr-cycle-time-vega.sh) and [summary stats](pr-cycle-time-summary.sh) for your own repo.

> **A note on these numbers:** These PR cycle times are *not* a reliable velocity signal. I do most work on local branches and merge locally to `main` before pushing---only worktree branches go through PRs, and I'm approving them, not doing thorough reviews. The review already happened during the plan and work phases. For a team, this metric gets much more useful with draft PRs and real reviews.

### Bug escape rate and recovery time

How often do bugs slip into a release, and how fast do I catch them?

{{% code file="release-fix-rate.sh" lang="sh" %}}

After v1.1.0---the first major public release---I shipped 5 consecutive fix-only releases over 12 hours:

| Release | Time after v1.1.0 | Fix |
|---------|-------------------|-----|
| [v1.1.1](https://github.com/calcmark/go-calcmark/releases/tag/v1.1.1) | 9 minutes | Homebrew cask config |
| [v1.1.2](https://github.com/calcmark/go-calcmark/releases/tag/v1.1.2) | 55 minutes | Terminal background bleed-through |
| [v1.1.3](https://github.com/calcmark/go-calcmark/releases/tag/v1.1.3) | 115 minutes | Brew tap URL, `cm help` display |
| [v1.1.4](https://github.com/calcmark/go-calcmark/releases/tag/v1.1.4) | 131 minutes | Markdown formatter per-line results |
| [v1.1.5](https://github.com/calcmark/go-calcmark/releases/tag/v1.1.5) | ~12 hours | Duplicate autocomplete function names |

That's a lot of escaped bugs. But look at the time between each fix release:

{{< vega id="mttr" spec="mttr-chart.json" >}}

| Stat | Value |
|------|-------|
| N | 5 fix releases |
| Median | 16 minutes |
| Mean | 144 minutes |
| SD | 248 minutes |

The first three fixes came in rapid succession---9, 46, and 60 minutes apart. That's a release with too many escaped bugs. But the gaps got longer, which is a *good* sign---fewer bugs escaping. Every one got a solution doc, so the same class of bug is less likely to escape again. Later releases confirm the pattern: v1.4.3 to v1.4.4 (macOS code signing) shipped in 9 minutes, and bugs still escape, but the rate keeps dropping. [Generate this chart](mttr-vega.sh) for your own repo.

### What I can't measure yet

I don't tag issues by type or complexity, so I can't separate "trivial typo fix" from "deep architectural refactor" in the lead time data. I don't have DORA metrics. The PR data is mostly noise for a solo developer. But the compound engineering workflow creates a natural trail of artifacts that *could* feed richer metrics---I just don't have the dashboards yet.

The discipline comes first. The data follows.

## What's not working yet

I haven't gotten the Compound Engineering plugin running in Claude's remote sessions or in GitHub Actions. Everything here is local---Claude Code on my Mac, multiple terminal tabs, git worktrees on my local filesystem. I can't kick off a plan in the cloud and walk away. This might already be solved and I just haven't figured it out.

Will Larson [predicts](https://lethain.com/everyinc-compound-engineering/) that compound engineering practices will be absorbed into tools like Claude Code natively. He's probably right. But right now, the gap between "using Claude Code" and "using Claude Code with compound engineering" is enormous.

## Getting started

If you want to try this yourself:

1. Install the [Compound Engineering plugin](https://github.com/EveryInc/compound-engineering-plugin) for Claude Code.
2. Start with `/workflows:brainstorm` to think through what you're building.
3. Use `/workflows:plan` to create a structured plan before writing any code.
4. After fixing a non-trivial bug, use `/workflows:compound` to capture the learning.
5. Run `/workflows:review` before merging anything significant.

Or try [Get Sh\*t Done](https://github.com/gsd-build/get-shit-done)---a different flavor of the same idea, and genuinely excellent.

The CalcMark repo is public at [calcmark/go-calcmark](https://github.com/calcmark/go-calcmark). Poke around the [`docs/solutions/`](https://github.com/calcmark/go-calcmark/tree/main/docs/solutions), the [`.planning/`](https://github.com/calcmark/go-calcmark/tree/main/.planning) directory, the [slash commands](https://github.com/calcmark/go-calcmark/tree/main/.claude/commands), and the [document-refresh skill](https://github.com/calcmark/go-calcmark/tree/main/.claude/skills/document-refresh). The receipts are all there.

[^concurrent]: You can run multiple Claude sessions against the same repo simultaneously using git worktrees---you can see it in auto-generated branch names like `claude/sleepy-dirac` and `claude/relaxed-bardeen` (13 distinct worktree branches in go-calcmark's history). Each agent reads the same solution docs, works in its own branch, and submits a PR. The CalcMark [project board](https://github.com/orgs/CalcMark/projects/1) shows the pattern---on March 3rd issues #14, #15, and #16 were all filed and fixed within hours of each other across different sessions.
