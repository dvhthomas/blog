---
title: VSCode for Markdown
date: 2022-02-06T07:56:12-07:00
tags: [markdown]
toc: true
series: []
summary: Writing Markdown using VS Code
mermaid: false
mathjax: false
draft: false
---

I'm writing a lot of [Markdown](https://www.markdownguide.org/) recently, and most of that is in GitHub repositories.
While it's nice to use the web-based editor included in GitHub, I prefer something offline for longer form writing.
There are tons of capable desktop apps for working with Markdown.

I happen to use Visual Studio Code for most of my work, so getting VS Code configured for a good writing experience is time well spent.
I use three extensions.

## [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

That captures spelling mistakes and lets you incrementally add new words to a personal dictionary.

For example, here is a warning about an unknown word.
The `cSpell` extension gives me a quick fix option to add that to a global or local dictionary.

{{< figure src="cspell.png" title="Spelling suggestion" >}}

## [Markdown Lint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)

That gives you all sorts of handy structural and logical checks on markdown like missing space.

Linters are opinionated but I'm OK with that for consistency.
For example, here is Markdown Lint letting me know that I've got too much space at the end of the file.

{{< figure src="lint.png" title="Linting suggestions" >}}

## [Grammarly](https://marketplace.visualstudio.com/items?itemName=znck.grammarly)

I used Grammarly for longer-form writing and it’s a great addition to the toolkit.

The extension is not built by the Grammarly team so there are rough edges.
I've noticed some logic errors in the newer version that fill up my VS Code `Output` console with a fair amount of cruft, but it's manageable.

Grammarly is pretty magical.
Here's an example of a suggestion that is pretty nuanced, tied to the word 'that'.

{{< figure src="grammarly.png" title="Grammarly suggestion" >}}

You must first have a free or paid Grammarly account, which brings me to a tip.
After you've installed it make sure you run the `Grammarly - login to grammarly.com` command via your `Cmd+Shift+P` palette in VS Code.
With that done you'll see a little notice in the VS Code status bar showing that account information.

### The complete picture

What I particularly like about the combination of those three extensions and VS Code's `Problems` window (`Shift+Cmd+M` to open).

Here is the dynamically produced list of issues I need to address in one Markdown document.
You can see issues from each extension.

For me, the biggest benefit is probably Grammarly because it catches _so_ many things that a simple editor, like GitHub's online Issues editor, easily miss with _meaning_ and grammar.

Because what I really want in a blog post or other writing is a clean signal that I've done my best.

{{< figure src="clean.png" title="An empty Problems list" >}}
