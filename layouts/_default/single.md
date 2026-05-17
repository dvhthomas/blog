{{- /*
    Markdown output format — emits page content as plain markdown with
    Hugo shortcodes (e.g. {{< ref "blog/foo" >}}) resolved to real URLs.
    Consumed by blog.go --pdf-only, which pipes this output to pandoc.

    Page title becomes the document H1 so pandoc renders it as the
    top-of-page heading (matches the Hugo-rendered HTML, which uses
    .Title for the page <h1>).

    Pages opt in by adding `outputs: ["html", "md"]` to their frontmatter
    (see content/resume/index.md).
*/ -}}
# {{ .Title }}

{{ .RenderShortcodes }}
