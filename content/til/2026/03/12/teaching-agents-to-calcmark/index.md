---
title: Teaching agents to use CalcMark
date: 2026-03-12T19:20:48-06:00
tags: [calcmark, agents, skills]
toc: true
series: [CalcMark]
summary: I wrote an agent skill so Claude Code can use CalcMark for calculations. Then I asked Claude what was hard, and it taught me a few things about building tools for agents.
draft: false
images: []
aliases: ["/til/2026-03-12/"]
---

I've been wanting to use [CalcMark](https://calcmark.org) from inside Claude Code for a while now.
The idea is simple: instead of the agent doing janky arithmetic in its head or spawning a Python script to multiply two numbers, it should just use `cm`---the CalcMark CLI---to do calculations properly with units, rounding, and all the domain-specific stuff baked in.

So I wrote a [skill](https://github.com/CalcMark/agent-skill) for it.

## What's an agent skill?

Claude Code (and Cursor, Copilot CLI, Gemini CLI, etc.) can pick up "skills" from markdown files dropped into specific directories.
A skill is basically a cheat sheet that tells the agent what a tool does, how to invoke it, and what patterns to follow.
For CalcMark, this means teaching the agent how to run `cm`, write `.cm` documents, and convert them to HTML or JSON.

Installing it is one `curl` command:

```sh
curl -sL --create-dirs -o .claude/skills/calcmark/SKILL.md \
  https://raw.githubusercontent.com/CalcMark/agent-skill/main/platforms/claude-code/.claude/skills/calcmark/SKILL.md
```

That drops a skill file into your project and suddenly Claude knows how to do capacity planning, compound interest, unit conversions---all the stuff CalcMark handles.

## The interesting part: asking Claude what went wrong

After I got the skill installed, I ran a real session.
Asked Claude to do some capacity planning calculations using CalcMark.
It worked...mostly.
But it stumbled in a few places that I wouldn't have predicted.

So I asked Claude to summarize what it found difficult.
And then I asked it to [fix the skill documentation itself](https://github.com/CalcMark/agent-skill/pull/1).

Here's what it came back with:

1. **Immutable variables** --- Claude tried to reassign a variable and hit a `variable_redefinition` error. CalcMark variables are immutable by design, and the skill didn't make that obvious enough.

2. **Unit propagation** --- It used raw arithmetic like `customers / 10` and got `34.3 customers` instead of `35 servers`. CalcMark's natural language forms like `343 customers at 10 customers per server` handle the unit conversion and rounding correctly, but the agent defaulted to the raw math.

3. **stderr killed JSON parsing** --- This was the big one.

## The stderr problem

CalcMark's CLI followed the Unix convention of printing errors to stderr.
Good practice, right?
Except when an agent pipes `cm --format json` into a JSON parser, it reads stdout.
If there's an error, stdout was *empty* and stderr had the human-readable message.
The agent's JSON parser got nothing, failed silently, and moved on.

The "good practice" of stderr for errors is actually *bad* for agents.
Agents aren't humans scanning terminal output---they're parsing structured data from stdout.
If your error isn't in the same channel as your success output, the agent just...misses it.

The [fix](https://github.com/CalcMark/go-calcmark/pull/54) was straightforward: when `--format json` is active, errors go to stdout as structured JSON:

```json
{
  "error": {
    "type": "evaluation_error",
    "message": "cannot reassign 'x' — variables are immutable",
    "line": 2,
    "code": "variable_redefinition"
  }
}
```

Same exit code, stderr still gets the human message too, but now the agent actually sees what went wrong.

## Better docs, fewer repeated mistakes

The other thing I learned is that agent skill files should be *compact*.
You don't want the agent re-reading a 2,000-line manual every time it needs to run a calculation.
But you also need enough context that it doesn't make the same mistakes twice.

I ended up [improving the agent integration guide](https://github.com/CalcMark/go-calcmark/pull/52) on calcmark.org---one page the skill can point to with a `WebFetch`---and added a "Common Pitfalls" section covering exactly the mistakes Claude made in practice.
The skill file itself stays lean with a condensed cheat sheet, and the full docs are a fetch away if the agent needs them.

## The meta thing

What I like about this whole loop is the meta-ness of it.
I wrote a skill, used it, asked the agent what sucked, and then the agent helped me fix both the skill docs *and* the underlying CLI.
The agent was both the user and the contributor.

And now I can do stuff like this in my daily workflow without thinking about it:

```sh
# Claude just... knows how to do this now
echo "compound $10000 by 7% monthly over 30 years" | cm --format json
```

If you're building CLI tools that agents might use, the takeaway is simple: make your errors show up where the agent is actually looking.
For JSON mode, that's stdout.
