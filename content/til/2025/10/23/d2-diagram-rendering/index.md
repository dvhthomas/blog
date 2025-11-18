---
title: D2 Diagram Rendering in Hugo
date: 2025-10-23T11:53:07-06:00
tags: [hugo, diagrams, d2, go]
toc: true
series: []
summary: How I integrated D2 diagram rendering into my Hugo blog with a custom Go script
mermaid: false
mathjax: false
draft: false
images: []
aliases: ["/til/2025-10-23/"]
---

## Why D2?

[D2](https://d2lang.com/) is a modern diagram-as-code tool.
I wanted diagrams in my blog posts that:

1. Live in version control as source code (not binary images)
2. Render consistently
3. Auto-update during development

Now, I already have Mermaid diagrams so what gives?
I really like the visual style and especially the layout of D2 diagrams.
They're not the best in all cases, but adding D2 support means I can pick and choose between that and Mermaid.
Hugo doesn't support D2 out of the box, so I built a custom tool.

## The solution

Claude and I wrote a Go program ([`blog.go`]({{< github path="blog.go" >}})) that:

- Finds all `.d2` files in `content/`
- Renders them to `.svg` files in the same location
- Watches for changes and re-renders automatically
- Integrates with Hugo's dev server

The SVG files are git-ignored. Only the `.d2` source files get committed.
Here's how the whole flow works:

{{< d2 src="rendering-flow.d2" width="15%" >}}
The D2 rendering pipeline at a glance, 15% of the page width
{{< /d2 >}}

The same diagram, but wider to show detail.
Try right-clicking to see the SVG or to save as an image.
Pretty cool!

{{< d2 src="rendering-flow.d2" width="30%" >}}
30% width version shows the complete workflow
{{< /d2 >}}

## How it works

### Initial render

When you run `task` (or `go run blog.go --serve`), the tool:

```go
// 1. Loads D2 config from Hugo's config.toml
config := loadConfig("config.toml")

// 2. Finds all .d2 files
d2Files, err := findD2Files("content")

// 3. Renders them concurrently
for _, file := range d2Files {
    renderFile(file, config, verbose)
}
```

The `renderFile` function builds a command like:

```bash
d2 --theme=6 --layout=elk diagram.d2 diagram.svg
```

### File watching

In development mode, the tool uses `fsnotify` to watch for changes:

```go
// Watch all content directories
filepath.Walk(contentDir, func(path string, info os.FileInfo, err error) error {
    if info.IsDir() {
        watcher.Add(path)
    }
    return nil
})

// Re-render on .d2 file changes (debounced 300ms)
if strings.HasSuffix(event.Name, ".d2") {
    time.AfterFunc(300*time.Millisecond, func() {
        renderFile(event.Name, config, verbose)
    })
}
```

The 300ms debounce prevents excessive re-renders when your editor saves multiple times.

### Config integration

D2 rendering options come from `config.toml`:

```toml
[params.d2]
    theme = "6"      # Theme ID (run d2 --list-themes)
    layout = "elk"   # Layout engine
    sketch = true    # Hand-drawn style
```

If you change config, the tool re-renders *all* diagrams.

## Using it in posts

Just create a `.d2` file in your page bundle. For example, the diagram above comes from this source:

{{< highlight txt "hl_lines=1" >}}
...styling...
d2 files -> blog.go: watches & renders
blog.go -> svg files: generates
svg files -> hugo: includes
hugo -> website: builds
{{</ highlight >}}

Reference it with the Hugo shortcode.
Having the matching `highlight` tags is optional but it does give you a spot to add a title for the resulting `<figure>` HTML element.

{{< highlight markdown "hl_lines=2" >}}
{{</* d2 src="rendering-flow.d2" width="400px" */>}}
The D2 rendering pipeline at a glance
{{</* /d2 */>}}
{{</ highlight >}}

The `width` parameter is optional. Use it to control diagram size. Hugo picks up the generated SVG and includes it in the page.

## Why this approach?

To be honest, writing a Go program seemed like overkill.
But after trying and failing with a pure Hugo approach, and then tearing my hair out with flaky shell scripts, it started to feel more reasonable ;-)

So yeah, I did consider using Hugo pipes or external processors, but this was simpler:

- Single Go binary, no extra dependencies
- Works with any Hugo theme
- Config lives in `config.toml` (one place for all settings)
- File watching is fast and reliable
- Easy to extend if I want more preprocessing later.
  This one is interesting because for D2 only, it does still feel a bit like overkill.
  But at least now I have an approach for the next whacko file format I want to support!

The whole [script]({{< github path="blog.go" >}}) is ~400 lines of Go.
Worth it for declarative diagrams in my blog.
