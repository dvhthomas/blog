---
title: JS Modules and Refactoring Hugo Shortcodes
date: 2025-10-29T15:11:43-06:00
tags: [javascript, hugo, modules]
toc: true
series: []
summary: In which I finally read some docs on what a JavaScript module is and how it made my Hugo shortcodes self contained.
draft: false
images: [network.png]
aliases: ["/til/2025-10-29/"]
---

## Current JS Setup

I wanted to update the JavaScript for the [Vega Lite](https://vega.github.io/vega-lite/) charts and [Mermaid](https://www.mermaidchart.com/) diagrams shortcodes.

The JavaScript for both shortcodes used to be imported into the page based on some front matter in Hugo pages.
Check out the `mermaid: false` front matter in the template for my blog posts:

```markdown
---
title: {{ replace .Name "-" " " | title }}
date: {{ .Date }}
tags: []
toc: true
series: []
summary:
mermaid: false
mathjax: false
draft: true
images: []
---
```

If set to `true`, the [script.hml](https://github.com/dvhthomas/blog/blob/40c01c5a6f72b189c889053a7d4f05640d78d13c/layouts/partials/script.html) partial would load the appropriate JavaScript:

```html
{{ if (.Params.mermaid) }}
<script async src="https://unpkg.com/mermaid@9.3.0/dist/mermaid.min.js"></script>
<script>
    mermaid.initialize({
        startOnLoad: true
    });
</script>
{{ end }}

{{ if (.Params.mathjax) }}
{{ partial "mathjax_support.html" . }}
{{ end }}

{{ if (.Params.vega) }}
<script src="https://cdn.jsdelivr.net/npm/vega@5.21.0"></script>
<script src="https://cdn.jsdelivr.net/npm/vega-lite@5.2.0"></script>
<script src="https://cdn.jsdelivr.net/npm/vega-embed@6.20.2"></script>
{{ end }}
```

I kept forgetting to set the `true` front matter to load the correct JS for each page and honestly just wanted:

- The latest JS for my plugins like Vega and Mermaid
- Keep all the JS inside the `vega.html` and `mermaid.html` shortcode files (which is how Hugo supports plugin-type inclusions).

~JavaScript~ EcmaScript (ES) Modules to the rescue!

## ES Modules

[Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) covers ES Modules thoroughly.
The bit that I hadn't realized previously is that ES Modules are loaded very efficiently by modern browsers through their use of caching.
**If an ES Module is loaded once on a page, it will not be loaded again if there are other attempts to load it.**

This is the workaround I needed to stop doing `if mermaid is true then load the mermaid.js in the script block` dance.
Instead, I can just load the ES Module for, say, Mermaid or Vega multiple times without worrying about the browser loading it again.

Bottom line: I could rework my shortcodes to use ES Modules, and stop worrying about whether I needed to explicitly `mermaid: true` or `vega: true` load them.

[I made a series of changes](https://github.com/dvhthomas/blog/commit/9826693ce6d0993e34b7ac071933de495b1d8ca9) to my shortcodes and how scripts are loaded in the Hugo site behind this blog.

For example, the [Mermaid shortcode](https://raw.githubusercontent.com/dvhthomas/blog/refs/heads/main/layouts/shortcodes/mermaid.html) now looks like this with a `script type=module` and a modern `import` statement (ignore the Go-isms because it's really a [Go HTML template](https://pkg.go.dev/html/template)):

{{< highlight go "hl_lines=10-11" >}}
{{/*
    Mermaid diagram shortcode using ES modules.

    Self-contained - no front matter needed. If you use the shortcode, the JS loads.
    The first shortcode on a page imports and initializes mermaid (cached for subsequent uses).
    All shortcodes output standard .mermaid divs and mermaid's startOnLoad handles rendering.
*/}}
{{ if not (.Page.Scratch.Get "mermaid-loaded") }}
<script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true });
</script>
{{ .Page.Scratch.Set "mermaid-loaded" true }}
{{ end }}
<div class="mermaid">
{{.Inner}}
</div>
{{</highlight>}}

Mermaid is smart enough not to initialize more than once per page, so we're good.

## Optimized Builds

While looking at the browser console I notices that there were *many* more networking requests that I expected.
Yes, the main ES module file was only being requested once, but what are all these 'chunks'?

{{< figure src="network.png" title="Module loading with option build-time chunks being loaded as static dependencies (sub-imports)">}}

I loaded my [Tips]({{< ref "blog/tips/index.md" >}}) page and looked at what the Vega requests looked like, and it was the same: 20 or more requests.
I followed [one of the links](https://cdn.jsdelivr.net/npm/vega-embed@7/+esm) and saw in the documentation header that this is a build-time optimization that ES modules make trivially easy:

```js
/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.39.0.
 * Original file: /npm/vega-embed@7.1.0/build/embed.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
```

And it all makes sense now why I see Rollup being used all over the place to [optimize builds](https://rollupjs.org/introduction/#tree-shaking) by only included what is strictly necessary.

So double win:

1. I only import ES modules once when I reference them 1+ times: browser caching.
2. Only the strictly necessary code is downloaded due to optional module static analysis and tree shaking.

Neat!
