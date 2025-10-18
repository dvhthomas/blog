# My Blog

[Bits By Me](https://bitsby.me) uses the blog uses the hugo static site generator. Publishing articles is easy; working with Jupyter notebooks that become embedded GitHub gists is slightly more involved.

## Prerequisites

The easiest way to start is to [use a GitHub Codespace](https://codespaces.new/dvhthomas/blog?quickstart=1) or run locally as a devcontainer in VS Code (see [`devcontainer.json`](./.devcontainer/devcontainer.json) for details).

If you must use locally then you need to install:

**Required:**
- [Go](https://go.dev) - [I use `asdf`](https://bitsby.me/2021/03/asdf-for-runtime-management/) so `asdf install golang latest` works for me.
- [Hugo](https://gohugo.io/installation/) - `brew install hugo`
- [Task](https://taskfile.dev/installation/) - `go install github.com/go-task/task/v3/cmd/task@latest` && `asdf reshim`.
- [D2](https://d2lang.com/) - `curl -fsSL https://d2lang.com/install.sh | sh -s --` (required if using D2 diagrams)

## Author and publish

Write a new blog post by providing a `TITLE` and calling the `task blog`:

```sh
TITLE="some-factoid" task blog
...write write write...
git add .
git commit -m "my cool post"
git push origin master
```

You do the roughly the same thing for Today I Learned posts but you don't provide a `TITLE`.

```sh
task today-i-learned
OR
task til
```

Each post is put into a folder like `til/1971-01-01/` or `blog/1971-01-01/awesome-title` with an `index.md` file. This gives you a spot to drop post-specific content next to the post itself. For example, if you want an image for a post you can drop it in that folder and reference it in the post thus:

## Hosting

The blog itself is hosting on GitHub Pages.
The DNS configuration is in [Squarespace Domains](https://domains.squarespace.com) accessible using my personal Google account.

## Development Workflow

**Start the dev server (recommended):**

```shell
task                      # Renders D2 diagrams + starts Hugo dev server
# OR
go run blog.go --serve    # Same thing without Task
```

Visit http://localhost:1313 to preview. The server watches for changes and automatically:
- Re-renders D2 diagrams when .d2 files change
- Rebuilds Hugo when markdown/templates change
- Reloads your browser

**Build for production:**

```shell
task build                # Renders D2 diagrams + builds Hugo site to public/
# OR
go run blog.go && hugo    # Same thing manually
```

Look at the draft [Tips](http://localhost:1313/2020/02/tips/) post to see examples of how you can use various elements like diagrams, code, and tweets.

## Content pre-processing

### D2 Diagrams

The blog supports [D2 diagrams](https://d2lang.com/) - a modern declarative diagram language. D2 files in your page bundles are automatically rendered to SVG images during the build process.

#### Prerequisites

Install D2:

```sh
# Install D2 (required for rendering diagrams)
curl -fsSL https://d2lang.com/install.sh | sh -s --
# Or via Go:
go install oss.terrastruct.com/d2@latest
```

#### Using D2 diagrams in posts

1. **Create a D2 file** in your page bundle directory:

```sh
# Example: content/blog/2025-10-17/my-post/diagram.d2
x -> y -> z: Simple flow
a -> b: {
  style.stroke: "#0d32b2"
  style.fill: "#c2d2e0"
}
```

2. **Reference it in your post** using the `d2` shortcode:

```markdown
{{</* d2 src="diagram.d2" */>}}
```

3. **Optional: Add a caption**:

```markdown
{{</* d2 src="diagram.d2" */>}}
This diagram shows the data flow through our system.
{{</* /d2 */>}}
```

#### Site-wide configuration

You can set D2 rendering options for all diagrams in `config.toml`:

```toml
[params.d2]
    theme = "6"         # D2 theme: number (0-8) or name like "cool-classics"
    layout = "elk"      # Layout engine: "dagre", "elk", etc.
    sketch = true       # Enable hand-drawn style globally
```

Available themes: Run `d2 --list-themes` to see all available themes.
Available layouts: Run `d2 --list-layouts` to see all available layout engines.

**Note:** These settings apply to all D2 diagrams site-wide. They're used during the render step before Hugo builds the site.

#### Shortcode usage

The shortcode is simple - just reference your D2 file:

```markdown
{{</* d2 src="diagram.d2" */>}}
```

With a caption:

```markdown
{{</* d2 src="diagram.d2" */>}}
This diagram shows the system architecture.
{{</* /d2 */>}}
```

The only parameter is:
- `src` (required): Path to the .d2 file relative to your page bundle

#### How it works

**Development mode (`task`):**
- Renders all D2 files once at startup
- Starts Hugo dev server with the `blog.go` tool
- Watches for changes to `.d2` files and automatically re-renders them
- Hugo detects the SVG changes and reloads the page

**Build mode (`task build`):**
- Renders all D2 files before building
- Generates static site in `public/` directory

**Generated files:**
- SVG files generated from `.d2` files are **not tracked in git** (see `.gitignore`)
- Only commit your `.d2` source files
- Generated SVGs are recreated during dev/build

#### Manual rendering

```sh
# Render all D2 diagrams
task render-d2

# Or use the Go tool directly
go run blog.go

# Watch D2 files only (no Hugo server)
go run blog.go --watch

# Verbose output
go run blog.go --verbose
```

#### Troubleshooting

**Diagrams not appearing:**
- Ensure D2 is installed: `d2 --version`
- Check that the `.svg` file was generated next to your `.d2` file
- Verify the `src` path in your shortcode matches the actual file name
- Try manually running: `task render-d2`

### Compress PNG Images

Following [this advice](https://til.simonwillison.net/macos/shrinking-pngs-with-pngquant-and-oxipng) it's a good idea to compress PNG images before adding to Git. Typical results: 480KB → 70KB (85% reduction).

#### Prerequisites

Install the compression tools once:

```sh
# macOS
brew install pngquant oxipng

# Linux (Ubuntu/Debian)
sudo apt install pngquant
cargo install oxipng
```

#### Using the squish script

The `squish` script recursively finds and compresses all PNG images in a directory:

```sh
# Preview what will be compressed (dry-run, safe)
./squish content/blog/2021-05-11

# Actually compress images (creates -fs8.png versions)
./squish content/blog/2021-05-11 --now

# Replace original images with compressed versions (destructive!)
./squish content/blog/2021-05-11 --now --clean
```


**Features:**
- Recursively finds all PNG files in a directory
- Handles filenames with spaces
- Shows before/after sizes and compression ratios
- Safe by default (dry-run mode)
- Intermediate `-fs8.png` files are git-ignored

**Workflow:**
1. Add images to your post directory
2. Run `./squish <path>` to preview
3. Run `./squish <path> --now` to compress
4. Review the `-fs8.png` files
5. Run `./squish <path> --now --clean` to replace originals
6. Commit the compressed images
