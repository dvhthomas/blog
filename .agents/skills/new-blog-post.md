# Skill: New Blog Post

Create a new blog post for bitsby.me that sounds like Dylan wrote it, not an AI.

## Inputs

- **topic**: What the post is about
- **type**: `blog` or `til` (default: `blog`)

## Steps

1. **Create the post file** using Task:
   ```sh
   TITLE="slug-from-topic" task blog
   # or for TIL:
   TITLE="slug-from-topic" task til
   ```

2. **Update the front matter**:
   - Write a real `title` — sentence case, no clickbait
   - Write a `summary` that's one or two plain sentences. What is this about and why should someone care? No "In this article we explore..." garbage.
   - Add relevant `tags` — lowercase, short. Look at existing posts for conventions.
   - Keep `draft: true` until the author says to publish.
   - Add `series` only if the author specifies one.

3. **Write the post body** following Dylan's voice (see Voice Guide below).

4. **If the post includes images**, place them in the page bundle directory alongside `index.md`. Compress PNGs with `./squish <path> --now --clean`.
    - Include the first image in the post as the [image] in the front matter.

5. **If the post includes diagrams**, create `.d2` files in the page bundle and reference them with `{{</* d2 src="filename.d2" */>}}`.

## Voice Guide

Dylan's writing is conversational, practical, and direct. Here's how to match it:

### Do

- Write like you're explaining something to a friend. First person, address the reader as "you".
- Start with the problem or the situation, not a thesis statement. "I've been struggling with X" or "Today was one of those days" — jump right in.
- Use short paragraphs. Single-sentence paragraphs are fine for emphasis.
- Be self-deprecating when natural. "I'm a crap programmer so statically typed languages are better for me (and you!)"
- Show real commands, real output, real errors. Walk through things step by step.
- Admit when you don't know something or when you forgot to read the docs.
- Use parenthetical asides for color — "(literally ... off the mountain!)"
- Link to sources generously. Credit where you got ideas.
- End simply. A sentence or two. No grand conclusions. "I really like asdf." is a perfectly fine ending.

### Don't

- Never open with "In this article, we'll explore..." or "Let's dive in!" or any variation.
- Never use: leverage, harness, unlock, empower, streamline, elevate, delve, foster, robust, seamless, cutting-edge, game-changer (unless making fun of it).
- Never write a "In conclusion" section. Just stop when you're done.
- Never pad with filler. If there's nothing more to say, the post is done.
- Never write in the passive corporate voice. "It was determined that..." — no. "I figured out that..." — yes.
- Never use exclamation marks for artificial enthusiasm. Use them sparingly and genuinely — frustration, surprise, humor.
- Never create bullet-point listicles without narrative flow. Bullets are for commands and short references, not for the main argument.
- Never fabricate Dylan's experiences, feelings, or opinions. If he didn't say it, don't write it in his voice. No invented quotes, embellished motivations, or made-up anecdotes.
- Never write long prose sections without inline evidence. Link to commits, PRs, issues, docs. Show real terminal output, config excerpts, sample data. Walls of text without references are boring.

### AI slop patterns to avoid

These are specific patterns that read as obviously AI-generated:

- **Staccato fragment hooks:** "Real data. Real insights. The tool delivers." — just write a normal sentence.
- **Mirror formulas:** "X is one thing, but Y is another" or "X is one thing. Living by X is another."
- **Overused AI phrases:** "The irony isn't lost on me," "The hidden tax of," "Let that sink in."
- **Instructional voice:** "Compare these two outputs:" — say "Here's what I mean:" or just show it.
- **Parallel teacher-voice:** "X tells you how A works. Y tells you how B works." — vary the structure.
- **Statement-statement-hook:** "No external services. No setup. Just results." — combine into a real sentence.
- **Dramatic single-word sentences:** "Every. Single. Night." — just say "every single night."
- **Labels as transitions:** "The design lesson:" or "The key insight:" — weave it in, don't label it.

### Em dashes

I like em dashes, but use them sparingly. Write them `like---this` in markdown (three hyphens, no spaces). When you find yourself reaching for an em dash, first consider whether a comma, colon, parentheses, or sentence restructure works better. If more than ~3 em dashes appear in a section, some of them should probably be something else.

### Structure patterns that work

- **Tool/tech posts**: Problem → discovery → installation/setup → usage with real examples → tips/gotchas → brief wrapup
- **Opinion/reflection posts**: Anecdote or moment → the insight → why it matters → brief tie-back
- **How-to posts**: What we're building → step by step with real output → troubleshooting → done

### Summaries

Write summaries like these real examples:
- "Using `task` as a Make alternative for your automation tasks and wonderment."
- "How two German automotive engineers got inside my head."
- "I had a great chat with a college student about a career in tech. I thought I'd share some of the advice I gave them."

Not like this:
- "A comprehensive guide to leveraging Task for streamlined automation workflows."
- "Exploring the transformative power of mentorship in technology careers."
