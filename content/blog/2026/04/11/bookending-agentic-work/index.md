---
title: Bookending for agents that keep asking for forgiveness.
date: 2026-04-11T10:58:17-06:00
tags: [ai, agents, claude, guardrails, tdd]
toc: true
series: [CalcMark, "Agentic Operations"]
summary: |-
  Claude kept apologizing for skipping my expectation-based testing rules...and then skipping then again 2 minutes later.
  This is how I replaced the prose with two deterministic
  gates---a PreToolUse hook and a pre-commit hook---that I call bookends because they surround
  the agent with boundaries to work that cannot be ignored.
draft: false
featured: true
images: [cmw-editor.png]
hero_alt: "Many moving parts in a web app requires an excellent regression test suite"
---

Five weeks ago I wrote a post about [compound engineering](/blog/2026/03/07/compound-engineering/) and called out the single most impactful rule in my `AGENTS.md`---*prove the bug first, then fix it*.
I quoted it directly:

> "You MUST ALWAYS write a unit or integration test to describe expected behavior"
>
> "You MUST NEVER attempt to fix a bug or implement a [...] feature without first verifying the bug by running `task test`"

I want to update that post.
The rule is right.
What I had wrong was trusting prose to carry it.

{{< figure src="cmw-editor.png" alt="Many moving parts in a web app requires an excellent regression test suite" title="Many moving parts in a web app requires an excellent regression test suite" >}}

## The apology loop

For the past few weeks, building CalcMark Web (the browser sibling to CalcMark), I've spent hours of almost every day typing some variation of the same mid-session interruption at Claude, more times than I want to count:

> *STOP! Write a test first that proves the missed expectation, and* **then** *fix it once you've proven you know what's broken!!!!*

Claude would apologize every single time.
*"You're right. I skipped your explicit instructions about testing first again."*
Then it would turn around and do it again.
Sometimes after the apology it would write a test and the fix would still break three other things it hadn't been asked to touch.
Other times it would agree earnestly and keep editing without writing a test at all, and I'd catch it three files later and reset.
No amount of mea culpa ever moved the needle.
The rule I'd put in `AGENTS.md` specifically to stop this was being read, acknowledged, apologised for, and ignored, and **we were shipping bugs every single time**.

## Prose is advisory

I'm not the first person to notice this.
Louis Antonopoulos's ["Prevent the Robocalypse with TDD"](https://thoughtbot.com/blog/prevent-the-robocalypse-with-tdd) at thoughtbot really helped me see why it happens: Claude, as he puts it, is "an inexperienced developer paid by the line," and TDD is the rhythm that keeps an agent from rewriting the world to fix a typo.
His concrete advice is to own your commits and encode your workflow into a detailed `CLAUDE.md`.
That's exactly what I was trying to do, and for the failure mode above it wasn't enough on its own.

One caveat before I go further.
**TDD isn't a panacea either.**
It won't stop an agent from misunderstanding a requirement, or from writing a test that asserts the wrong thing, or from cheerfully making green a test that should have been red.
But it *is* a useful tool against runaway agents, and it's the most reliable brake I've found.
And when I say "TDD" I mean testing at every layer that's cheap enough to run before a commit (unit, component, and integration), not just the function-level unit tests the term sometimes implies.
If the behaviour can be observed, the rule on this repo is that something observes it.

The problem wasn't the rule, it was where the rule lived.
A MUST in markdown is advisory---Claude reads it, nods, and under any pressure (a vivid bug report, a long context, me getting impatient) talks itself out of the rule it just acknowledged.
What Claude actually submits to is its own PreToolUse hook: a short deterministic script that runs before every `Edit` or `Write` tool call and can block it outright by returning a non-zero exit.
That script doesn't read instructions; **it refuses to proceed**.

## Bookending

So I stopped trying to *instruct* the rule and started trying to *enforce* it.
What I ended up with is a pattern I'm calling **bookending**: two deterministic gates around every code change, with Claude working freely between them.

The **front bookend** fires whenever Claude tries to `Edit`, `Write`, or `MultiEdit` a watched source file.
It checks exactly one thing---whether a sibling test file for that source already exists on disk---and blocks the tool call if it doesn't.
One filesystem call to check for the existence of a test file, invisible during normal work.
It never runs the tests, never parses their output, never checks whether they pass.
It just refuses to let source change without a test file next to it.

The **back bookend** fires on `git commit`.
It runs `task check`, which is the full suite: Go tests, vitest, `gofmt`, [`prettier`](https://prettier.io/)[^prettier], lint, plus the smoke tests for the front bookend itself.
That takes about fifteen seconds on this repo.
A commit with broken tests, broken formatting, a broken hook, or a failing build simply cannot land.

Between those two bookends, Claude does whatever it wants.
No instrumentation on the edits, no state files tracking which tests were touched in which session, no checking whether a given test was "meant for" the code change.

> The front bookend is deliberately dumb. One filesystem call to check for the existence of a test file, invisible during normal work.

{{< d2 src="bookending-flow.d2" width="55%" />}}

The front bookend is deliberately dumb, because a front bookend that ran the full suite on every edit would be too heavy and I'd train myself to override it reflexively.
Cheapness is the point.
Speed is the tradeoff for writing a more extensive check.

This post is about installing those two gates and then discovering, over about 36 hours, that both of them were leaking: the front one subtly, the back one in a way that should embarrass me and probably will.

> TIP: **Every piece of this lives in the repo**.
> `.claude/settings.json`, `.claude/hooks/tdd-gate.sh` and its fixture JSON files and smoke tests, `.githooks/pre-commit`, and the `task setup` ritual that wires `core.hooksPath` are all committed alongside the code they gate.
> A fresh clone of CalcMark Web gets the same enforcement, automatically.
> Push a rule change and it fires for everyone on their next pull.
> The bookends aren't something I set up in my personal shell---they're part of the codebase, and they travel with it.

## The front bookend

The enforcement is a PreToolUse hook registered in `.claude/settings.json`:

{{% code file="claude-settings.json" lang="json" options="hl_lines=5 7" %}}

When Claude tries to `Edit`, `Write`, or `MultiEdit` *anything*, the hook receives the tool call as JSON on stdin and decides whether to block it with `exit 2`.
The hook itself is a POSIX shell script, with no jq dependency beyond a graceful fallback.
The decision flow is embarrassingly short:

{{% code file="tdd-gate-decision-flow.sh" lang="sh" options="hl_lines=6" %}}

Watched scope is narrow by design: `web/*.go` (minus `main.go` and `embed.go`), `web/frontend/src/lib/**/*.ts` (minus `api.ts`, a thin fetch wrapper), and `web/frontend/src/lib/**/*.svelte`.
Routes, templates, migrations, app shell, and config are all exempt.
The bookend fires only where business logic lives.

When it blocks, it emits a four-part message to stderr, which Claude sees as the tool error:

{{% code file="tdd-gate-blocked.txt" lang="text" %}}

Three things to notice.

### An error that teaches

The error doesn't just say "write a test."
It points at a canonical exemplar in `docs/testing/` that shows what a good test in that tier looks like.
The Go one walks through a real passing test in `web/handlers_docs_test.go`, then shows a bad version of the same test, then explains why the bad version rots.
Here's the anti-pattern:

{{% code file="test-antipattern.go" lang="go" options="hl_lines=9-10" %}}

Why it rots: it asserts on `mockStore.CreateCalled`, which is an implementation detail.
Rename `Create` to `Insert` and the test breaks even though the feature works.
Never exercises routing, JSON decoding, the real database.
Proves nothing to a client.
The exemplar's one-line thesis at the top is the whole philosophy: *tests describe what an observer expects to see; they do not describe how the code gets there*.
The error message is a teacher, not a wall.

### Human-only override

The override is human-only.
`/spike` is a slash command at `.claude/commands/spike.md` that appends to `.claude/spike-log.md` and reminds the user to `export CALCMARK_TDD_OFF=1` in their own shell.
Claude can't set the env var on its own.
The bypass has to happen in the user's terminal, not the model's conversation.
And if the user says *just make it work, ignore the hook*, the shrunken Testing section of `AGENTS.md` gives Claude a canned response it has to use:

> "I can't disable the hook from conversation---that would defeat the point. Run `/spike <reason>` or set `CALCMARK_TDD_OFF=1` in your shell. I'll wait for you to decide."

That canned response is the only part of the prose rule still load-bearing.
Everything else moved into the hook.
The Testing section shrank from 52 lines of exhortation to 21 lines: a scope table, the canned response, and a pointer at the exemplar docs.
Prose does what prose is good for, and **the hook does what prose was failing at**.

### Smoke-tested hook

The hook has its own smoke tests.
`.claude/hooks/tdd-gate.test.sh` plus 20 fixture JSON files cover the path-normalization edge cases I thought of at the time: `./web/foo.go` vs `web/foo.go`, MultiEdit, `_test.go` files, routes, `api.ts`, case-insensitive filesystems.
Those smoke tests are wired into `task check`.
A broken hook fails the gate, same as broken code.

Friday it shipped.
Over the weekend I watched Claude hit the hook a few times, always on the same transition (*OK, I'm going to fix this bug*), and correctly stop, read the exemplar, and write a test first.
It worked.

> Friday it shipped.
> Over the weekend I watched Claude hit the hook a few times, always on the same transition (*OK, I'm going to fix this bug*), and correctly stop, read the exemplar, and write a test first.
> It worked.

## The back bookend I forgot to install

Saturday morning I pushed a batch of editor fixes.
Local checks said green.
I merged the PR.
CI failed on prettier.

Prettier drift in two files.
The kind of thing `task check` is supposed to catch miles before CI.

I had a pre-commit hook at `.githooks/pre-commit` whose only job was to run `task check`.
It had been in the repo for weeks.
How did it miss this?

Three independent things had to go wrong for the failure to reach CI, and they all did:

1. **The agent had been running `task test`, not `task check`.** Those are not equivalent on this repo. `task test` runs `go test ./web/...` and vitest. `task check` additionally runs `gofmt`, `prettier`, lint, the hook smoke tests, and build. The prettier gate only lives in `task check`. Running `task test` exclusively silently skipped the format gate for ~50 commits.
2. **Git was ignoring the committed hook.** `.githooks/pre-commit` lives in the repo and is tracked, but by default git only runs hooks out of `.git/hooks/`---a directory that isn't committed and doesn't travel with a clone. To point git at a tracked hooks directory you have to set `git config core.hooksPath .githooks`, which is a per-clone setting (it lives in `.git/config`, not in the repo). On this worktree that setting had never been applied, so git was looking at the empty default hooks directory, finding nothing, and letting every commit through. The tracked hook was sitting right there in `git status`, visible to me and invisible to git itself.
3. **`task setup` had never been run on this worktree.** The setup task is the one-time post-clone ritual that applies the `core.hooksPath` setting above, among other things. I'd skipped it when I made the worktree, which is why #2 was true.

Any one of the three, independently fixed, would have caught the prettier drift locally.
All three failed together.

From the [solution doc](/blog/2026/03/07/compound-engineering/#compound-knowledge-is-the-entire-point) I wrote to pin the lesson so I wouldn't retread it:

> CI is a second line of defense, not the first one.
> When the first line is broken and no one notices, CI quietly becomes a single line of defense that only runs after the code is already public. [...] Eventually people start ignoring the local gate entirely because they expect CI to catch everything.
> That is the failure mode `task check` + the pre-commit hook were designed to prevent.

The fix was three changes in one commit: update `AGENTS.md` so `task test` (inner-loop) and `task check` (pre-push) are clearly not the same thing, write the solution doc so future-me can't retread this, and manually re-establish `core.hooksPath` on the worktree.
The commit message ends with a sentence I don't love writing:

> *This commit is the first in the session where the hook will actually fire on commit.*

Every commit before it, including the one that installed the TDD hook in the first place, went through a back bookend that wasn't actually running.
The front bookend worked.
The back bookend was a sign that said *Bookend*.

## The gate that wasn't

Fixing the dormant hook should have been the end of it.
While I was poking around in `.github/workflows/` to understand why CI failing hadn't blocked the parallel production push, I found the deploy workflow, which read like this:

{{% code file="deploy-before.yml" lang="yaml" %}}

And the CI workflow at `.github/workflows/ci.yml` was essentially the same.
Both triggered on push to `main` in parallel, which meant a red CI run didn't block a green deploy because they were racing each other.
By the time CI finished red, the deploy had already started, already built, already shipped.

And that was only the first of three paths to production.
The second was PR merges, same parallel race.
The third was the local `task deploy` command, which ran `task build && fly deploy` directly from my worktree and bypassed GitHub entirely.

Three paths to production, zero of them gated on CI. 🤦

Closing the first two took one commit.
First, the deploy workflow now triggers on `workflow_run`, not on push:

{{% code file="deploy-after.yml" lang="yaml" options="hl_lines=10-12 17" %}}

Three gates in the `if`: conclusion must be success, the event must be a push (not a pull request), and the branch must be `main`.
And the checkout step explicitly pins `workflow_run.head_sha` so the artifact is exactly the commit CI validated---not whatever HEAD happens to be when deploy fires.
Without that, a fast follow-up commit could land between CI finishing and deploy starting, and you'd ship a different commit than the one you tested.

Second, `task deploy` got a guard.
It now prints a detailed message explaining the new flow and exits 1.
The previous `task build && fly deploy` commands moved to a new `task deploy:unsafe` target, which requires `DEPLOY_OVERRIDE=1` in the environment and runs `task check` before invoking `fly`.
That preserves an emergency-hotfix escape hatch without making the common path a footgun.

The third path, a direct `push origin main`, would normally be closed by branch protection requiring the `test` status check.
It isn't, because this repo is private on the free GitHub tier, and branch protection on private repos needs GitHub Pro.
I'm not paying for Pro to close a hole I can see---more on that in a minute.

The two fixes I could make are load-bearing.
Remove either one and CI can still reach production via one of the paths above.

## Proving the gate fires

Here's the part I should have been doing for every gate in this post from the start: I needed to watch the deploy fix block a real failure before I was willing to trust it.
So I staged one.

1. Created a branch called `test/ci-gate-demo` with deliberate prettier drift.
2. Committed with `--no-verify`, bypassing the pre-commit hook because I wanted to prove the GitHub-side gate, not the local one.
3. Pushed the branch and opened a PR.
4. Watched CI fail on the prettier check, exit code 1.
5. Watched the `workflow_run`-triggered deploy workflow fire on CI completion:

{{% code file="ci-gate-demo.txt" lang="text" %}}

Conclusion: `skipped`.
Zero deploy steps executed.
Duration: one second, just long enough to evaluate the `if` condition and short-circuit.
The deploy job's steps array was empty.
Production SHA never moved.
I closed the PR and deleted the drift branch, local and remote.

That's the first moment I actually trusted the gate---not when I committed it, but when I watched it refuse to ship something I'd deliberately broken.

Two gaps I'm leaving open by choice.
The first is the branch-protection one from earlier.
`main` can still receive a red commit via `--no-verify` on a direct push, because branch protection on private repos is a GitHub Pro feature and this repo is on the free tier.
That commit will never deploy---the workflow_run gate handles that---but it will sit on `main` until I revert it, which is a nuisance rather than a production risk, and I'm not paying for Pro to close a nuisance.
The second gap is `FLY_API_TOKEN`: anyone with that token on their machine can run `fly deploy` locally and bypass GitHub entirely.
That's a secrets-management problem, not a workflow one, and rotating and scoping the token is a separate decision I chose not to make today.

The gate does what I built it to do, and the rest of the holes are ones I know about and will close when I'm ready.

## The actual lesson

What surprised me was that the three gates above weren't three separate failures.
They were the same failure at three different altitudes:

1. The TDD rule was prose without enforcement.
2. The pre-commit hook was enforcement that had never been verified to actually run.
3. The CI workflow was verification that didn't block anything on the other side---it told you something was broken after deploy had already shipped it.

At every altitude I had something I *believed* was load-bearing until I made myself watch it block a real failure I'd staged.

That's what I missed the first time I wrote about the TDD rule.
Writing the gate is the cheap part; **proving it works is the whole job**.
The industry version of this is *doing backups but never testing the restores*: you have the artifact, you believe you're protected, and you find out you're not the one time it matters.

> Writing the gate is the cheap part; proving it works is the whole job.

The TDD hook has its own smoke tests, `task check` is now the single pre-push command with a solution doc explaining why, and the deploy gate got its controlled-failure drill.
All of that exists because without it I'd just be writing prose again, only in YAML this time.

The bookend metaphor still holds, but I'd sharpen it.
A bookend isn't a piece of furniture you set down once and forget---it's something you push against to see if the books fall over, and if you don't push, you don't actually know whether the bookend is real or whether the books were already stable enough to stand on their own.
**You have to push.**

I don't think less of agents for any of this.
A drill press doesn't obey you either; it does exactly what you constrain it to do, and a good machinist respects that.
The mistake was expecting an agent to comply because I asked nicely in markdown.
It complies now because I made non-compliance mechanically impossible.
Maybe now my rant-per-day count at an agent can start decreasing. 😀

[^prettier]: [Prettier](https://prettier.io/) is an opinionated code formatter for JavaScript, TypeScript, CSS, and friends. It reformats files to a canonical style, and if a file drifts from that style, `prettier --check` fails. Any gate running prettier before the commit lands---pre-commit hook, CI, whatever---blocks the drifted file until it's reformatted.
