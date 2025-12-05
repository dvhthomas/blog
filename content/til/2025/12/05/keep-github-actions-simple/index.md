---
title: Keep Github Actions Simple
date: 2025-12-05T07:43:04-07:00
tags: [github, actions, ci]
toc: true
series: []
summary: |-
  A reminder to keep Github Actions simple and as free of logic as possible.
draft: false
images: []
---

## Shifting Build Platforms is an Opportunity
I was chatting with someone about shifting GitLab pipelines to GitHub Actions. 
One of the options is lift-and-shift.
Clearly the system has to still be deployable: without that nothing else really matters.
Over time, there's a tendency to put a ton of logic into the YAML files that represent build, test, and deployment pipelines.
When shifting between workflow platforms, it's a chance to clean up.

If you've ever tried to debug a GitHub Actions workflow YAML, you know exactly what I mean.
Push a change, see it break, debug the logic, tweak the YAML file, push again, rinse and repeat.
You can literally see this in the git log :-)

My practice is to **keep logic out of the YAML files** and instead use external scripts or tools to handle complex tasks.
This makes the YAML files easier to read and maintain, and also makes it easier to reuse the same logic across multiple workflows.

## A Shell Script Example

For my experimentation Calcmark language, I have [this](https://github.com/CalcMark/go-calcmark/blob/v0.1.23/.github/workflows/release.yml#L36) GitHub Action workflow:

{{< highlight yaml "hl_lines=36">}}
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

permissions:
  contents: write

jobs:
  release:
    name: Build and Release
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.21'

      - name: Install GitHub CLI
        run: |
          type -p gh >/dev/null || sudo apt-get install -y gh

      - name: Run release script
        env:
          CI: true
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          chmod +x release.sh
          ./release.sh
{{</ highlight >}}

This is almost 100% boilerplate to set up a build and deploy process using Go and a couple of tools.
The *real* work is done by that last inocuous looking line at the bottom: [`release.sh`](https://github.com/CalcMark/go-calcmark/blob/v0.1.23/release.sh).
That's where the logic lives.

Now, you may not *like* shell scripts but you have to admin that they're easier to run and debug locally and test with something like a `--local` vs. `--server` flag rather than the old try-push-debug-push-try loop.

## A Go Example

If shell scripts make you wince, this website uses a Go script.
Here's the relevant part of the workflow YAML:

```yaml
- name: Render D2 diagrams
  run: go run blog.go
- name: Build with Hugo
  env:
    HUGO_CACHEDIR: ${{ runner.temp }}/hugo_cache
    HUGO_ENVIRONMENT: production
    TZ: America/Los_Angeles
  run: |
    hugo \
      --gc \
      --minify \
      --baseURL "${{ steps.pages.outputs.base_url }}/"
- name: Generate resume PDF
  run: go run blog.go
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: ./public
```

And [read the `blog.go` script]() to understand how I use the exact same script for local development and build as I do in the GitHub Action.
You'll see that it generates by resume PDF based on content in my [resume page]({{< ref "resume/index.md">}}), and generates SVG diagrams for articles using the [D2](https://d2lang.com/) language.
Putting all that stuff in an Action YAML would be a total pain.
