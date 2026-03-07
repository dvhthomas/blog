# Agent Instructions

This is a Hugo static site for [bitsby.me](https://bitsby.me), a personal blog by Dylan Thomas.

## Project Structure

- **Hugo site** with config in `config.toml`
- **Task runner**: [Taskfile](https://taskfile.dev) — see `Taskfile.yaml`
- **D2 diagrams**: `.d2` files in page bundles are rendered to SVG by `go run blog.go`
- **Content types**: blog posts, TIL (Today I Learned), recipes, work/resume pages

## Content Conventions

All content lives under `content/` as Hugo page bundles (directory with `index.md`).

### Blog posts

Path pattern: `content/blog/YYYY/MM/DD/slug/index.md`

Create with: `TITLE="my-post" task blog`

Front matter:
```yaml
title: My Post Title
date: 2026-03-07T00:00:00-07:00
tags: []
toc: true
series: []
summary:
draft: true
images: []
```

### TIL posts

Path pattern: `content/til/YYYY/MM/DD/slug/index.md`

Create with: `TITLE="my-til" task til`

Uses the same front matter as blog posts.

### Recipes

Path pattern: `content/recipes/slug/index.md` (no date nesting)

Create with: `TITLE="my-recipe" task recipe`

Recipes use `{{< recipe >}}`, `{{< ingredients >}}`, and `{{< instructions >}}` shortcodes for schema.org structured data. See `archetypes/recipes.md` for the full template.

## Development

```sh
task              # Dev server with D2 watching (http://localhost:1313)
task build        # Production build: D2 + Hugo + resume PDF
task render-d2    # Render D2 diagrams only
```

The Go tool `blog.go` handles D2 rendering, file watching, and resume PDF generation.

## Skills

Reusable agent skills live in `.agents/skills/`. Each markdown file describes a task with inputs, steps, and guidelines.

Available skills:
- **[new-blog-post](.agents/skills/new-blog-post.md)** — Create a new blog or TIL post in Dylan's voice

## Key Rules

- Images should be placed in the page bundle directory alongside `index.md`
- Compress PNGs before committing: `./squish <path> --now --clean`
- Generated SVGs from D2 files are gitignored — only commit `.d2` source files
- Posts default to `draft: true` — set to `false` to publish
- The site deploys via GitHub Pages on push to `main`
