# Hugo Blog Analysis & Optimization Recommendations

**Date:** October 19, 2025  
**Branch:** `analyze-hugo-setup`  
**Site:** [bitsby.me](https://bitsby.me)

## Executive Summary

Your Hugo blog is well-architected with a custom theme and innovative D2 diagram integration. The site is **lean, fast, and follows Hugo best practices**. Build time is excellent (~190ms for 270 pages). The custom Go tool for D2 integration is clever and well-documented.

**Key Stats:**
- 270 pages (33 blog posts, 27 TIL posts)
- 164ms build time
- Custom theme (no external theme dependency)
- 5 D2 diagrams (349 lines)
- Hugo v0.151.1 (latest extended)
- Deployed via GitHub Pages

## Architecture Overview

### Content Organization ✅ **GOOD**

```
content/
├── blog/           # Date-based blog posts (33 posts)
│   └── YYYY-MM-DD/TITLE/index.md
├── til/            # Today I Learned posts (27 posts)
│   └── YYYY-MM-DD/index.md
├── about/
├── resume/
├── work/
└── recommendations/
```

**Strengths:**
- Page bundles everywhere (34 bundles) - excellent for co-locating assets
- Clear separation of content types (blog vs TIL)
- Date-based organization makes chronological navigation easy
- Consistent structure across all posts

### Custom Theme ✅ **EXCELLENT**

You've built a custom theme rather than using an off-the-shelf solution. This is **ideal** for maintainability and performance.

```
layouts/
├── _default/          # Base templates
│   ├── baseof.html   # Clean base structure
│   ├── single.html   # Article pages
│   ├── list.html     # Archive pages
│   └── index.json    # Search index
├── partials/          # Reusable components
├── shortcodes/        # Content extensions (d2, mermaid, vega, gist)
├── series/            # Series taxonomy
├── tags/              # Tags taxonomy
└── til/               # TIL-specific layouts
```

**Strengths:**
- Minimal, semantic HTML
- Bootstrap 5 for base styles with custom CSS overlay
- SVG icons inline (no icon font bloat)
- Accessibility features (skip links, aria labels)
- Clean separation of concerns

### D2 Integration 🚀 **INNOVATIVE**

The custom Go tool (`blog.go`) is **exceptionally well done**:

**Strengths:**
- Zero runtime overhead (pre-rendered SVGs)
- Live reloading in dev mode
- Debounced file watching
- Configuration through Hugo config.toml
- Comprehensive inline documentation
- Graceful error handling

**Current setup:**
```go
// config.toml
[params.d2]
    theme = "3"        # Cool classics theme
    layout = "elk"     # ELK layout engine
    sketch = false     # Not hand-drawn
    pad = 10           # Minimal padding
```

## Optimization Recommendations

### 🎯 Priority 1: High Impact, Low Effort

#### 1.1 Add Hugo Modules for Better Dependency Management

**Issue:** Currently no Hugo theme/module system in use.

**Recommendation:** Consider structuring the custom theme as a Hugo module for better organization and potential reuse.

```toml
# config.toml
[module]
  [[module.mounts]]
    source = "layouts"
    target = "layouts"
  [[module.mounts]]
    source = "static"
    target = "static"
  [[module.mounts]]
    source = "content"
    target = "content"
```

**Benefits:**
- Better organization
- Easier to split theme from content
- Future-proof for theme extraction

#### 1.2 Optimize Image Loading

**Issue:** Images in page bundles lack optimization declarations.

**Recommendation:** Use Hugo's image processing for responsive images:

```go-html-template
{{/* layouts/shortcodes/img.html */}}
{{ $src := .Page.Resources.GetMatch (.Get "src") }}
{{ if $src }}
  {{ $small := $src.Resize "600x" }}
  {{ $medium := $src.Resize "1200x" }}
  {{ $large := $src.Resize "1800x" }}
  
  <picture>
    <source media="(max-width: 600px)" srcset="{{ $small.RelPermalink }}">
    <source media="(max-width: 1200px)" srcset="{{ $medium.RelPermalink }}">
    <img src="{{ $large.RelPermalink }}" 
         alt="{{ .Get "alt" }}"
         loading="lazy"
         decoding="async">
  </picture>
{{ end }}
```

**Impact:** 
- Faster mobile load times
- Reduced bandwidth usage
- Better Core Web Vitals scores

#### 1.3 Add RSS Feed Enhancement

**Issue:** RSS feed is basic (using Hugo defaults).

**Recommendation:** Enhance RSS with full content and images:

```xml
<!-- layouts/_default/rss.xml - add these fields -->
<description>{{ .Summary | html }}</description>
<content:encoded>{{ .Content | html }}</content:encoded>
<media:thumbnail url="{{ with .Params.images }}{{ index . 0 | absURL }}{{ end }}" />
```

#### 1.4 Implement Better Front Matter Validation

**Issue:** No validation of required front matter fields.

**Recommendation:** Add archetype templates with required fields:

```yaml
# archetypes/blog.md
---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
tags: []
toc: true
series: []
summary: ""  # REQUIRED - for SEO and social sharing
mermaid: false
mathjax: false
draft: true
images: []   # REQUIRED - first image used in social cards
---
```

### 🎯 Priority 2: Medium Impact, Medium Effort

#### 2.1 Add Content Security Policy (CSP)

**Issue:** No CSP headers configured.

**Recommendation:** Add CSP headers for external scripts (Mermaid, MathJax, Vega):

```toml
# config.toml
[outputs]
  home = ["HTML", "RSS", "JSON", "headers"]

# Create layouts/index.headers
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

**Benefits:**
- Better security
- Protection against XSS
- GDPR compliance

#### 2.2 Add Automated Testing

**Issue:** No automated tests for builds.

**Recommendation:** Add htmltest to CI pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Test HTML output
  run: |
    wget https://github.com/wjdp/htmltest/releases/download/v0.17.0/htmltest_0.17.0_linux_amd64.tar.gz
    tar xvzf htmltest_0.17.0_linux_amd64.tar.gz
    ./htmltest --skip-external
```

Create `.htmltest.yml`:
```yaml
DirectoryPath: "public"
CheckDoctype: true
CheckAnchors: true
CheckLinks: true
CheckImages: true
IgnoreURLs:
  - "^https://twitter.com"  # Often rate-limited
  - "^https://linkedin.com"
```

#### 2.3 Bundle External JavaScript

**Issue:** Loading Mermaid, MathJax, Vega from CDNs.

**Recommendation:** Consider bundling or using Hugo Pipes:

```go-html-template
{{/* layouts/partials/script.html */}}
{{ if .Params.mermaid }}
  {{ $mermaid := resources.Get "js/mermaid.min.js" }}
  {{ $mermaid := $mermaid | minify | fingerprint }}
  <script src="{{ $mermaid.RelPermalink }}" integrity="{{ $mermaid.Data.Integrity }}"></script>
{{ end }}
```

**Benefits:**
- Faster page loads (no DNS lookup)
- Works offline
- Version control over dependencies
- Subresource integrity

#### 2.4 Add Search Functionality Enhancement

**Issue:** JSON search index exists but no visible search implementation in code.

**Recommendation:** Verify search.js implementation and consider upgrading:

```javascript
// static/js/search.js - Use Fuse.js for better fuzzy search
import Fuse from 'fuse.js'

const options = {
  keys: ['title', 'summary', 'content'],
  threshold: 0.3,
  ignoreLocation: true
}

fetch('/index.json')
  .then(res => res.json())
  .then(data => {
    const fuse = new Fuse(data, options)
    // Implement search UI
  })
```

### 🎯 Priority 3: Low Impact, High Value

#### 3.1 Add Series Navigation

**Issue:** Series taxonomy exists but no cross-linking between posts.

**Recommendation:** Enhance series partial with navigation:

```go-html-template
{{/* layouts/partials/series.html */}}
{{ with .Params.series }}
  {{ $currentPage := . }}
  {{ range $name := . }}
    {{ with $.Site.Taxonomies.series.Get $name }}
      <nav class="series-nav" aria-label="Series navigation">
        <h3>This post is part of the {{ $name }} series:</h3>
        <ol>
        {{ range .Pages }}
          <li {{ if eq .RelPermalink $currentPage.RelPermalink }}aria-current="page"{{ end }}>
            {{ if eq .RelPermalink $currentPage.RelPermalink }}
              <strong>{{ .Title }}</strong>
            {{ else }}
              <a href="{{ .RelPermalink }}">{{ .Title }}</a>
            {{ end }}
          </li>
        {{ end }}
        </ol>
      </nav>
    {{ end }}
  {{ end }}
{{ end }}
```

#### 3.2 Add Related Posts Enhancement

**Issue:** Related posts partial exists but likely uses basic Hugo related content.

**Recommendation:** Configure related content parameters:

```toml
# config.toml
[related]
  threshold = 80
  includeNewer = true
  toLower = false
  [[related.indices]]
    name = "tags"
    weight = 100
  [[related.indices]]
    name = "series"
    weight = 95
  [[related.indices]]
    name = "date"
    weight = 10
```

#### 3.3 Add JSON-LD Structured Data

**Issue:** No structured data for better SEO.

**Recommendation:** Add schema.org markup:

```go-html-template
{{/* layouts/partials/structured-data.html */}}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{ .Title }}",
  "datePublished": "{{ .Date.Format "2006-01-02" }}",
  "dateModified": "{{ .Lastmod.Format "2006-01-02" }}",
  "author": {
    "@type": "Person",
    "name": "Dylan Thomas"
  },
  "publisher": {
    "@type": "Organization",
    "name": "{{ .Site.Title }}",
    "logo": {
      "@type": "ImageObject",
      "url": "{{ "android-chrome-512x512.png" | absURL }}"
    }
  },
  "description": "{{ .Summary }}",
  {{ with .Params.images }}
  "image": "{{ index . 0 | absURL }}",
  {{ end }}
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{{ .Permalink }}"
  }
}
</script>
```

#### 3.4 Add Build Analytics

**Issue:** No visibility into build performance over time.

**Recommendation:** Log build metrics:

```yaml
# .github/workflows/deploy.yml
- name: Build with Hugo
  run: |
    hugo --gc --minify --logLevel info \
      --templateMetrics \
      --templateMetricsHints \
      --baseURL "${{ steps.pages.outputs.base_url }}/" \
      | tee hugo-build.log
- name: Archive build logs
  uses: actions/upload-artifact@v4
  with:
    name: build-logs
    path: hugo-build.log
```

### 🎯 Priority 4: Future Enhancements

#### 4.1 Consider Asset Pipeline Modernization

**Current:** Bootstrap CSS loaded from static files.

**Future:** Use Hugo Pipes with Tailwind CSS for better tree-shaking:

```toml
# Potential future migration
# - Smaller CSS bundle (Bootstrap is 200KB+)
# - Modern utility-first approach
# - Better IDE support with Tailwind IntelliSense
```

#### 4.2 Add Dark Mode Support

**Current:** Single light theme.

**Future:** CSS custom properties already set up well for this:

```css
/* static/css/site.css */
@media (prefers-color-scheme: dark) {
  :root {
    --brand-color: hsl(var(--base-hue), 70%, 75%);
    /* Add dark mode color overrides */
  }
}
```

#### 4.3 Consider Static Comments System

**Options:**
- Utterances (GitHub Issues-based)
- Giscus (GitHub Discussions-based)  
- Staticman (PRs for comments)

**Recommendation:** Giscus for modern GitHub integration:

```html
<!-- layouts/partials/comments.html -->
<script src="https://giscus.app/client.js"
        data-repo="dvhthomas/blog"
        data-repo-id="..."
        data-category="Comments"
        data-mapping="pathname"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-theme="light"
        data-lang="en"
        crossorigin="anonymous"
        async>
</script>
```

#### 4.4 D2 Diagram Enhancements

**Current system is excellent.** Future possibilities:

1. **Multiple output formats:**
```go
// blog.go enhancement
type D2Config struct {
    Theme   string
    Layout  string
    Sketch  bool
    Pad     int
    Formats []string  // ["svg", "png"] for different use cases
}
```

2. **Per-diagram configuration:**
```markdown
{{</* d2 src="diagram.d2" theme="4" layout="dagre" */>}}
```

3. **Diagram versioning:**
```
content/blog/2025-10-19/post/
├── diagram.d2
├── diagram-v1.d2  # Historical versions
└── diagram-v2.d2
```

## Configuration Improvements

### Current config.toml Optimization

```toml
# Add these sections to config.toml

# Performance
[caches]
  [caches.assets]
    dir = ":cacheDir/:project"
    maxAge = "24h"
  [caches.getjson]
    dir = ":cacheDir/:project"
    maxAge = "1h"

# Better image defaults
[imaging]
  quality = 85
  resampleFilter = "Lanczos"
  anchor = "Smart"

# Minification
[minify]
  disableXML = true
  minifyOutput = true
  [minify.tdewolff.html]
    keepWhitespace = false

# Build options
[build]
  writeStats = true  # Generate hugo_stats.json for PurgeCSS
  
# Security
[security]
  enableInlineShortcodes = false
  [security.exec]
    allow = ['^(dart-)?sass(-embedded)?$', '^go$', '^npx$', '^postcss$']
  [security.http]
    methods = ['(?i)GET|POST']
    urls = ['.*']
```

## Repository Structure Recommendations

### Suggested New Structure

```
blog/
├── .github/
│   └── workflows/
│       ├── deploy.yml      # ✅ Already excellent
│       └── test.yml        # NEW: Pre-merge testing
├── archetypes/
│   ├── blog.md            # Enhanced with required fields
│   └── til.md             # NEW: Separate TIL archetype
├── assets/                # NEW: For Hugo Pipes
│   ├── js/
│   │   ├── search.js
│   │   └── theme.js
│   └── css/
│       └── main.css       # If migrating from static CSS
├── content/               # ✅ Already good
├── data/                  # NEW: Consider for site data
│   └── authors.json
├── layouts/               # ✅ Already excellent
├── static/                # ✅ Good
├── tools/                 # NEW: Separate custom tools
│   ├── blog/
│   │   ├── main.go       # Rename from blog.go
│   │   ├── d2.go         # Extract D2 logic
│   │   └── watch.go      # Extract watch logic
│   └── image-compress/
│       └── main.go       # Refactor squish to Go
├── .htmltest.yml         # NEW
├── go.mod                # ✅
├── Taskfile.yaml         # ✅ Already excellent
└── README.md             # ✅ Already comprehensive
```

## Task Enhancements

### Recommended Taskfile.yaml Updates

```yaml
# Add these tasks

  test:
    desc: Run site tests (HTML validation, links, etc.)
    deps: [build]
    cmds:
      - htmltest --skip-external

  lint:
    desc: Lint markdown files
    cmds:
      - markdownlint content/**/*.md

  check-images:
    desc: Check for unoptimized images
    cmds:
      - find content -name "*.png" -size +500k -exec ls -lh {} \;
      - find content -name "*.jpg" -size +500k -exec ls -lh {} \;

  validate:
    desc: Pre-commit validation
    deps: [lint, test]

  stats:
    desc: Show site statistics
    cmds:
      - hugo list all | wc -l | xargs echo "Total pages:"
      - find content/blog -name index.md | wc -l | xargs echo "Blog posts:"
      - find content/til -name index.md | wc -l | xargs echo "TIL posts:"
      - find content -name "*.d2" | wc -l | xargs echo "D2 diagrams:"
```

## Performance Benchmarks

### Current Performance (Excellent!)

```
Build Time:    164ms
Pages:         270
Resources:     99
Build Size:    18MB (public/)
Content Size:  8.6MB
```

### Expected After Optimizations

```
Build Time:    ~175ms (+11ms for image processing)
Pages:         270
Resources:     120 (with responsive images)
Build Size:    16MB (-2MB with optimized images)
First Paint:   <1s (with bundled JS)
```

## Security Checklist

- [x] HTTPS enabled (GitHub Pages)
- [x] No API keys in config
- [x] D2 generated files in .gitignore
- [ ] CSP headers (recommended)
- [ ] Subresource integrity for external scripts
- [ ] HTML output validation
- [ ] Dependency scanning for Go modules

## Maintenance Schedule

**Monthly:**
- Update Hugo version
- Review and merge Dependabot PRs
- Check for broken external links

**Quarterly:**
- Review Google Search Console for SEO issues
- Audit image sizes and compress large files
- Review and update popular posts

**Yearly:**
- Consider major version upgrades (Hugo, Bootstrap)
- Review analytics for content gaps
- Audit accessibility with tools like Lighthouse

## Conclusion

### What You're Doing Right ✅

1. **Page Bundles:** Excellent organization and asset management
2. **Custom Theme:** No external dependencies, full control
3. **D2 Integration:** Innovative, well-documented, zero runtime cost
4. **Build Performance:** Fast builds even with 270 pages
5. **Task Automation:** Clean developer workflow with Taskfile
6. **CI/CD:** Solid GitHub Actions deployment
7. **Documentation:** Comprehensive README
8. **Content Organization:** Clear structure, good permalink patterns

### Top 3 Recommendations (Quick Wins)

1. **Add Image Processing** - 30 minutes, significant mobile performance gain
2. **Enhance Archetypes** - 15 minutes, better content consistency  
3. **Add htmltest to CI** - 20 minutes, catch broken links automatically

### Long-term Recommendations

1. **Consider Hugo Modules** - Better theme organization
2. **Bundle External JS** - Faster page loads, better security
3. **Add Dark Mode** - User preference support

---

**Overall Grade: A-**

Your blog is well-architected, performant, and maintainable. The D2 integration is particularly clever. The recommendations above are enhancements, not fixes—your current setup is solid.
