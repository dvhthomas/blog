---
title: Tooling to build learning micro-sites
date: 2026-05-01T22:13:14-06:00
tags: [agents, skills, plugins, education]
toc: false
series: []
summary: Train My Brain is a Claude Code plugin that builds micro-sites for personal learning. Have an esoteric learning need? Spin up a site---modules, exercises, and a glossary, served locally and ready to publish.
draft: false
images: [hero.png]
hero_alt: A Train My Brain curriculum on building traditional wood arrows
---

I learn best when I can poke at a focused, self-contained micro-site about whatever I'm trying to understand. So I built [`train-my-brain`](https://github.com/alwaysmap/train-my-brain), a [Claude Code](https://docs.claude.com/en/docs/claude-code/overview) plugin that does exactly that.

You run `/tmb:create`, it asks seven questions, then it spends about 30 minutes building the site---and that long session surprised me until I watched what it was actually doing.
Coming up with a sensible curriculum as a whole thing takes a lot of research, and then each module gets its own subagent doing more research in parallel before any prose gets written.
At the end you get a Hugo site running at `localhost:1313`. The screenshot above is one I built for [making traditional wood arrows](https://dvhthomas.github.io/arrow-building/).

A few things I learned along the way:

- **Research once, build in parallel.** The first version had every module-builder agent do its own web research. They'd disagree on terminology and cite different sources. Now a single researcher writes `research.yaml` first---glossary, reading list, concept map---and every parallel builder grounds its work in that one substrate.
- **Agents take the path of least resistance.** Module-builders kept emitting `<!-- TODO: source image -->` comments instead of actually finding free-use imagery. The TODO is invisible to readers; the page just looks like a wall of text. The fix was making real images or YouTube embeds a [hard rule, not a preference](https://github.com/alwaysmap/train-my-brain/commit/426351c).
- **Make the reviewer deterministic.** Every check the consistency reviewer does is a small script under `scripts/`---adjacency, frontmatter, URL reachability, glossary merge. If I let the LLM "review" something on its own, it would silently skip steps. A bash script that exits non-zero will not.
- **You can give Claude a real picker UI.** The seven-question interview started as plain text prompts, which meant typo-prone free-text answers for things that should be multiple choice. Switching to the [`AskUserQuestion`](https://github.com/alwaysmap/train-my-brain/commit/d027ba6) tool gives you an actual TUI picker---arrow keys, enter to select---for any structured question. I had no idea that was available until I went looking.
- **Build a real one to find the real bugs.** [PR #1](https://github.com/alwaysmap/train-my-brain/pull/1) was five fixes from building the arrow-building curriculum end to end. Quoting bugs in `new-module.sh`, escaped Hugo shortcodes rendering as raw text, Mermaid v11 syntax gotchas. None of those showed up until I used the thing in anger.

The last step, if you want to share what you built with anyone else, is `/tmb:publish`---which walks you through pushing the site to GitHub Pages. That's how the [arrow-building sample](https://dvhthomas.github.io/arrow-building/) above got online.

If you also like learning by building, give it a spin: `claude plugin marketplace add alwaysmap/alwaysmap-marketplace && claude plugin install tmb@alwaysmap`.
