---
description: Create a new blog post, TIL, or recipe for bitsby.me. Scaffolds the page bundle, sets up front matter, and writes content in Dylan's voice.
---

# Skill: New Content

Create a new piece of content for bitsby.me that sounds like Dylan wrote it.

## Inputs

- **topic**: What the content is about
- **type**: `blog`, `til`, or `recipe` (default: `blog`)

## Content Types

Content lives in `content/` as Hugo page bundles (directory with `index.md`). Always scaffold with `task`, where the slug is kebab-cased like `my-cool-recipe`.

| Type | Command | Path pattern |
|------|---------|-------------|
| Blog | `TITLE="slug" task blog` | `content/blog/YYYY/MM/DD/slug/index.md` |
| TIL | `TITLE="slug" task til` | `content/til/YYYY/MM/DD/slug/index.md` |
| Recipe | `TITLE="slug" task recipe` | `content/recipes/slug/index.md` |

Recipes use `{{< recipe >}}`, `{{< ingredients >}}`, and `{{< instructions >}}` shortcodes (see `archetypes/recipes.md`).

## Steps

1. **Scaffold the page bundle** using the table above.

2. **Update front matter** from the generated archetype:
   - `title` — sentence case, no clickbait
   - `summary` — one or two plain sentences (see [voice guide](voice-guide.md#summaries))
   - `tags` — lowercase, short. Check existing posts for conventions.
   - `draft: true` — always. Only the author publishes.
   - `series` — only if the author specifies one.

3. **Write the content** following the [voice guide](voice-guide.md). This is mandatory, not optional.

4. **Images** go in the page bundle directory:
   - Compress PNGs: `./squish <path> --now` then `mv image-fs8.png image.png`
   - Set the hero/OG image in front matter: `images: [filename.png]`
   - Use `{{</* figure src="image.png" title="Caption" */>}}` for the first image in the body

5. **Diagrams** — create `.d2` files in the page bundle:
   ```markdown
   {{</* d2 src="filename.d2" */>}}
   ```

6. **Before finishing**, scan the content for [AI slop patterns](voice-guide.md#ai-slop-patterns) and [banned words](voice-guide.md#dont). Fix any violations.
