---
title: Cookie-free analytics with GoatCounter on Hugo
date: 2026-05-08T11:46:03-06:00
tags: [hugo, analytics, goatcounter]
toc: true
series: []
summary: The two Hugo template gates that keep dev-server pageviews out of production analytics.
draft: true
images: []
hero_alt:
---

[GoatCounter](https://www.goatcounter.com) (MIT-licensed, cookie-free, free under 100k pageviews/month on the hosted tier) is one `<script>` tag on any static site. On a Hugo site, the non-obvious bit is gating that script so dev-server pageviews don't pollute the production count.

## The two gates

`layouts/partials/head.html`, just before `</head>`:

```go-html-template
{{ with site.Params.goatcounter }}
{{ if hugo.IsProduction }}
<script data-goatcounter="https://{{ . }}.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
{{ end }}
{{ end }}
```

`config.toml`:

```toml
[params]
    goatcounter = "bitsby"  # Subdomain at goatcounter.com
```

The two conditions do different jobs:

- **`{{ with site.Params.goatcounter }}`** is for portability. If the param is missing or empty, nothing is emitted. Commenting out one line in `config.toml` disables analytics. A fork of the repo doesn't accidentally ship counts under someone else's account.
- **`{{ if hugo.IsProduction }}`** is for hygiene. `hugo server` (the dev server, what `task` runs in this repo) leaves `hugo.IsProduction` as `false`; `hugo` (the build command, what `task build` runs) sets it to `true`. So localhost previews never phone home, and deployed pages do.

## Verify each gate

```sh
# Dev — no tag injected
task && curl -s http://localhost:1313/ | grep -c data-goatcounter
# 0

# Production build — tag present
hugo --gc --minify && grep -c data-goatcounter public/index.html
# 1
```
