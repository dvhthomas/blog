---
title: Shrinking output from Go WebAssembly
date: 2025-11-17T21:51:27-07:00
tags: [go, wasm, tinygo, crosscompilation, optimization, compression]
toc: true
series: []
summary: |
  Cross-compiling Go code to WebAssembly (WASM) is really powerful.
  It also produces massive files to download.
  So how can we shrink this down?
draft: false
images: [calcdown-app.png]
---

For [go-calcmark](https://github.com/calcmark/go-calcmark) I decided that I would keep an implementation of the spec in the same Git repository as the spec itself.
In other words, I would write the reference specification for my little 'Markdown plus calcluations' grammar in Go.

Crucially, I didn't want to then have to re-write an implementation to power my web editor [calcdown.app](https://calcdown.app) ([source](https://github.com/calcmark/calcdown-web)) in TypeScript.
I decided instead to use the built-in cross-compilation of the Go language to WebAssembly (WASM).

## Step 1: Just Get it Working

The Go tooling is rock solid.
For every tagged release I push to GitHub, there's a corresponding release that automatically includes the appropriate WASM binary ([example of 0.1.23 release](https://github.com/CalcMark/go-calcmark/releases/tag/v0.1.23)).

This is mostly just a case of using the `GOOS=js` and `GOARCH=wasm` environment variables to inform the Go compiler ([source](https://github.com/CalcMark/go-calcmark/blob/1978bc45f115b45e77d36bf6b730cbb1d34a1685/impl/cmd/calcmark/main.go#L77))

```go
// Build the WASM module
	cmd := exec.Command("go", "build", "-o", outputWasmPath)
	cmd.Dir = wasmDir
	cmd.Env = append(os.Environ(),
		"GOOS=js",
		"GOARCH=wasm",
	)
```

The output from the `calcmark wasm` tool tells the story, and this is exactly what is being used in the CI / release creation process:

```sh
% ./calcmark wasm
Building WASM module...
  Version: 0.1.23
  Source:  /Users/bitsbyme/projects/go-calcmark/impl/wasm
  Build:   /Users/bitsbyme/projects/go-calcmark/impl/wasm/calcmark-0.1.23.wasm
✓ WASM module built successfully
Copying WASM module...
  From: /Users/bitsbyme/projects/go-calcmark/impl/wasm/calcmark-0.1.23.wasm
  To:   calcmark-0.1.23.wasm
✓ WASM module copied successfully
Copying wasm_exec.js...
  From: /Users/bitsbyme/.asdf/installs/golang/1.24.4/go/lib/wasm/wasm_exec.js
  To:   wasm_exec.js
✓ wasm_exec.js copied successfully

WASM build complete!
  Output files:
    calcmark-0.1.23.wasm
    wasm_exec.js
```

## Step 2: Compress It

Do you notice just how big the WASM file is?
Almost 4MB!
Now that's trivial for a server or desktop app, but as a [runtime dependency for a web app](https://github.com/CalcMark/calcdown-web/blob/main/scripts/download-wasm.js) it's waaaaaaaay too big.

My first thought was that compression could help.
Good old gzip and a newer algorithm that I hadn't come across before: Brotli.
So in my web app, I [created some scripts](https://github.com/CalcMark/calcdown-web/blob/c1143bd614b7ef5fbc6097fc2e43b55f36ff949a/package.json#L7) specifically to download the correct WASM file from the `go-calcmark` repo, then compress those files as part of the build process prior to pushing to production.

```json
"wasm:fetch": "node scripts/download-wasm.js",
"wasm:clean": "node scripts/download-wasm.js --clean",
"wasm:verify": "node scripts/verify-compression.js",
"postinstall": "npm run wasm:fetch",
```

The real work is being done by the incredible `vite-plugin-compression2` plugin for the even more incredible Vite development server and build tool:

```ts
// Brotli compression for WASM files (better compression)
		compression({
			algorithm: 'brotliCompress',
			include: /\.(wasm)$/,
			threshold: 1024,
			deleteOriginalAssets: false
		}),
		// Gzip compression for WASM files (broader compatibility)
		compression({
			algorithm: 'gzip',
			include: /\.(wasm)$/,
			threshold: 1024,
			deleteOriginalAssets: false
		})
	],
	assetsInclude: ['**/*.wasm'],
	// Ensure WASM files are treated as external assets in SSR
	ssr: {
		noExternal: []
	},
```

So `npm run build` does this for us, among other things:

```sh
> node scripts/download-wasm.js

📦 CalcMark WASM Download Script

📌 Target version: v0.1.23
📦 Downloaded version: v0.1.23
✅ WASM files already exist for this version, skipping download
   Current: v0.1.23
   To force re-download, run: npm run wasm:clean
```

The theory is that by shipping not just the calcmark.wasm, but also pre-compressed gzip and brotli versions of that file, clients would have to downalod a lot less data.

But how much less?
A lot, and this is basically free because (pretty much) every browser supports both gzip and brotli compression.
Yep: down from a whopping 3.8M to 814K.

```sh
% ls -lh client/_app/immutable/workers/assets
total 11648
-rw-r--r--@ 1 bitsbyme  staff   3.8M Nov 17 22:14 calcmark-DO9gXOVC.wasm
-rw-r--r--@ 1 bitsbyme  staff   814K Nov 17 22:14 calcmark-DO9gXOVC.wasm.br
-rw-r--r--@ 1 bitsbyme  staff   1.1M Nov 17 22:14 calcmark-DO9gXOVC.wasm.gz
```

This is what is used in the live [calcdown.app](https://calcdown.app/) for all of the syntax highlighting and evaluation of the actual calculations:

{{< figure src="calcdown-app.png" title="The web based caldown app showing syntax highlighting and live calculation evaluation using the Go WASM library" >}}

## Step 3: TinyGo

I just couldn't stop there though.
As I was investigation cross-compilation to WASM in go, I came across [TinyGo](https://tinygo.org/).
This is an alternative to the Go compiler that can target WASM, and 'Small Places' in general.
So I thought: could it do better?
My go-calcmark implementation doesn't do anything fancy with concurrency so it's a good candidate for the simple expectations that TinyGo can meet.

This took some trial and error and I have not yet built it into my release pipeline because I'm not sure it's worth the effort yet.

#### Get the Tools

I use [asdf]({{< ref "tags/asdf" >}}) to manage all of my runtimes and luckily there's a plugin for TinyGo distinct from Go.

```sh
$ asdf plugin add tinygo https://github.com/troyjfarrell/asdf-tinygo
$ asdf install tinygo latest
* Downloading tinygo release 0.39.0...
tinygo0.39.0.darwin-arm64.tar.gz: OK
tinygo 0.39.0 installation was successful!
$ asdf set -u tinygo latest
$ tinygo version
tinygo version 0.39.0 darwin/arm64 (using go version go1.24.4 and LLVM version 19.1.2)
```

#### Build and fail

The build command was pretty much the same as before.

```sh
GOOS=js GOARCH=wasm tinygo build -o my.wasm ./impl/wasm
go: downloading golang.org/x/text v0.30.0
go: downloading github.com/shopspring/decimal v1.4.0
error: could not find wasm-opt, set the WASMOPT environment variable to override

# A quick search recommended using the --no-debug flag
$ GOOS=js GOARCH=wasm tinygo build -o my.wasm --no-debug ./impl/wasm
error: could not find wasm-opt, set the WASMOPT environment variable to override
[⎇ demo-cleanup]% brew install binaryen
```

Turns out that the TinyGo WASM optimizer itself depends on on the [Binaryen WASM toolchain](https://github.com/WebAssembly/binaryen).
So let's install that then try again:

```sh
$ brew install binaryen
...stuff...
```

And after a bit more research, I wound up with this beauty.
Note the `-target=wasm` instead of the `GOARCH=wasm`

```sh
$ tinygo build -target=wasm -no-debug -o calcmark-0.1.23-tiny.wasm./impl/wasm/main.go
$ ls -lh calcmark-0.1.23-tiny.wasm
-rw-r--r--@ 1 bitsbyme  staff   655K Nov 17 13:52 calcmark-0.1.23-tiny.wasm
```

Wow! Now we're down to just 655K instead of nearly 4MB.
This is progress.

### Validate the TinyGo WASM workers

I had an AI agent spin up a little 1 page test to validate that the TinyGo WASM would work as I expect it to.
Honestly, I was expected to discover some weird edge cases but no: it worked perfectly.

{{< figure src="tinygo.png" title="TinyGo WASM test page showing that key functions for the calcmark parser, tokenizer, and evaluator work perfectly in 655 kilobytes" >}}

## One Last Test

I haven't decided yet whether I want to depend on TinyGo or not.
This entire project is getting sidetracked by my learning curve and I need to build more features into the basic CalcDown editor (like, maybe saving stuff!).

But the final thing I did to see how far I could take it:

```sh
$ brotli calcmark-0.1.23-tiny.wasm
$ ls -lh calcmark-0.1.23-tiny.wasm*
-rw-r--r--@ 1 bitsbyme  staff   655K Nov 17 13:52 calcmark-0.1.23-tiny.wasm
-rw-r--r--@ 1 bitsbyme  staff   192K Nov 17 13:52 calcmark-0.1.23-tiny.wasm.br
```

**192K** for a TypeScript and JavaScript compatible version of a Go library that can be used in a web browser.
Technology is truly a wonderful thing.

```sh
Fresh builds created:
  - ✅ calcmark-0.1.23.wasm (3.7
  MB) - Standard Go build
  - ✅ calcmark-0.1.23-tiny.wasm
  (655 KB) - TinyGo build
  - ✅ wasm_exec.js (17 KB) -
  Standard Go glue
  - ✅ wasm_exec_tiny.js (16 KB) -
   TinyGo glue
```

I'll leave the entire HTML page here because it's instructive on how to load and consume WASM created by a Go library using either the Go or the TinyGo compilers.
Line 24 is where the 'native' code is called.

{{% code file="test-tinygo.html" lang="html" %}}
