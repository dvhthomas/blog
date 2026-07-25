---
description: Create or update a Work article on bitsby.me — the Situation/Behavior/Impact case studies in content/work/. Load this for any new work story, or when editing an existing one.
---

# Skill: Work Article

Work articles are professional case studies at `content/work/<slug>/index.md`. They are not blog posts. A reader lands on one to answer "what did Dylan actually do, and what came of it?"

Everything in the [voice guide](voice-guide.md) applies, including the Hard Rules. This skill covers what is specific to work articles.

## The hard constraint

**You cannot invent any of this.** A work article is a factual record of Dylan's career. Every claim about what he did, why he did it, how a team was run, or how something turned out has to come from Dylan or from a public source you can link.

Two failure modes, both unacceptable:

1. **Inventing facts** — team size, dates, budgets, technologies, outcomes.
2. **Inventing opinions** — what he cared about, what he found hard, what he'd do differently. This is the subtler one and it creeps in as editorial flourish. See the voice guide's "Never invent or infer Dylan's opinions."

When a paragraph needs a fact you don't have, **stop and ask**. Do not write around it with something plausible. A short article built from real facts beats a full one padded with inference.

Ask early, in one batch. Good questions to ask up front:

- How long did it run, and when?
- Who was on the team, and what was your role specifically?
- How did you run it — cadence, methodology, working style?
- What made it hard?
- What happened as a result, and how do you know?
- Anything public I can link to? Announcements, repos, docs, videos, press.

## Research the public record

Work articles get their credibility from links. Before writing, search for what is publicly documented: product announcements, GitHub repos, docs, conference talks, press coverage. Verify claims rather than trusting a summary — open the repo, read the README, check the date.

Distinguish clearly in your own head between:

- What Dylan told you (goes in as his work)
- What the public record shows (goes in with a link)
- What you inferred (does not go in)

## Structure

Three H2 sections, always in this order. No intro before `## Situation`, no conclusion after `## Impact`.

### Situation

What was going on and why the work was needed. Set up the problem plainly — do not build suspense, withhold a reveal, or end paragraphs on a cliffhanger. Describe it the way you'd brief a colleague.

Include where Dylan and his organization sat in the picture, so the reader knows whose problem this was.

### Behavior

What Dylan and his team did. This is about **the work and how it was run**, not a feature tour of what was built.

Weight it accordingly:

- How the engagement was won or initiated, if relevant
- Team shape, duration, and Dylan's specific role
- How the work was managed — cadence, methodology, communication style, and *why* that fit
- A brief description of what shipped, with a link to it if it's public

If you find yourself three paragraphs deep in what the software can do, cut back. The product details belong in a sentence or two.

### Impact

Four to six bullets, each bolded lead-in then one or two sentences. Every bullet should be a distinct, high-value outcome — fold overlapping ones together rather than padding the list.

Cover a mix where the facts support it: outcomes for the customer, outcomes for the business, whether the work outlived the engagement, and what it proved. Link the evidence.

Do not restate the same win in two bullets with different words.

## Front matter

```yaml
---
title: Sentence-case Title, No Clickbait
date: YYYY-MM-DDT12:00:00-06:00
toc: false
series: []
summary: |-
  One or two plain sentences. What is this and why should someone care?
mathjax: false
draft: true
images: [hero.png]
hero_alt: "Literal description of what the image shows"
capabilities:
  - two-to-four-terms
---
```

- **date** — controls listing order in `/work/`. Use when the work happened, or when the thing it produced became public. Check the dates of neighbouring articles so the ordering reads sensibly, and say which you chose and why.
- **draft** — `true` until Dylan says otherwise. See "Publishing" below for the one thing that makes this dangerous.
- **capabilities** — a real taxonomy with term pages at `/capabilities/<term>/`. Reuse existing terms rather than inventing near-duplicates:

  ```bash
  grep -A8 '^capabilities:' content/work/*/index.md | grep -oE '^\S+-  .*' | sed 's/.*-  *//' | sort -u
  ```

## Images

**Alt text is required, not optional.** Both mechanisms emit an `alt` attribute automatically, so the risk is not a missing attribute — it is a useless one.

- **Hero** — set `images: [file.png]` and it renders above the article via `layouts/_default/single.html`, and drives `og:image` and `twitter:image` for social sharing. `hero_alt` sets the alt text; **without it the alt silently falls back to the article title**, which describes the article, not the picture. Always write `hero_alt`.
- **Body figures** — `{{</* figure src="file.png" title="Caption" alt="Description" */>}}`. The shortcode falls back `alt` → `caption` → `title`, so pass an explicit `alt` whenever the title is a caption rather than a description.

Write alt text by looking at the image and describing what is in it, concretely. "Fleet Routing App showing a solved scenario: 36 shipments across 12 vehicles around Memphis" — not "screenshot of the app."

**Do not use the hero image again as a body figure.** It renders twice. Reference it in prose instead ("the screenshot at the top is…"). Some older articles do duplicate it; don't copy that.

Compress before committing. One command, which compresses and replaces the originals:

```bash
DIR="content/work/<slug>" task squish
```

`DIR` is the bundle directory, not a file path. Never hand-`mv` the `-fs8.png` over the original — the script catches JPEGs, multiple images, and leftovers that a manual move misses.

Audit alt coverage across a build with:

```bash
python3 -c "
import re,pathlib
for f in pathlib.Path('public').rglob('*.html'):
    for m in re.finditer(r'<img\b[^>]*>', f.read_text(errors='ignore'), re.S):
        if not re.search(r'\balt\s*=', m.group(0)): print(f, m.group(0)[:100])"
```

Note the `re.S` and the multiline-aware match — `grep -oE '<img[^>]*>'` cannot match a tag that wraps across lines and will report false passes.

## Cross-linking

Work articles reference each other. Use the `ref` shortcode with a path from `content/`:

```
[the reference application]({{</* ref "work/google-fleet-routing-app/index.md" */>}})
```

When a new article expands on something an existing one mentions in passing, link both ways: the older article's prose and its relevant Impact bullet should point at the new detail.

### The draft-link trap

`ref` to a `draft: true` page **does not fail the production build**. It silently renders `<a href="">`. So linking a draft article from a published one puts dead links on the live site.

Always check before considering the work done:

```bash
hugo --quiet --destination /tmp/hugo-prod && grep -rn '<a href="">' /tmp/hugo-prod/ | head
```

Any output means either publish the target or hold the links back.

## Before finishing

1. Run the [edit-content](edit-content.md) checks, especially the voice guide's Hard Rules.
2. Re-read every sentence that expresses a judgment. Did Dylan say that? If not, cut it.
3. Confirm each factual claim traces to Dylan or a link.
4. Production build clean, no empty hrefs, every image has descriptive alt.
5. State any assumption you made — dates, orderings, wording you chose — so Dylan can correct it.

## Publishing

Never flip `draft: false`, commit, or push without Dylan saying so explicitly. Pushing to `main` publishes the site. See the repo [CLAUDE.md](../../CLAUDE.md).
