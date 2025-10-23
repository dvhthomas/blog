---
title: Main not Master, and Python formatting
date: 2021-04-29T17:46:36-06:00
tags: [git, python, tools]
toc: true
series: []
summary: Default git branch name and Python formatting
mermaid: false
mathjax: false
draft: false
---

## Main not Master

I keep forgetting to choose the [more inclusive name](https://github.com/github/renaming) `main` for a default for new git repositories. Thanks to the handy hint when using `git init` these days, here is a one-liner to change this on an installation-wide basis:

```sh
git config --global init.defaultBranch main
```

## Let Black do the work of formatting Python code

Follow [instructions here](https://dev.to/adamlombard/how-to-use-the-black-python-code-formatter-in-vscode-3lo0):

```sh
pip3 install black
```

Since I'm using [asdf for my Python installation]({{< ref "blog/2021/03/07/asdf-for-runtime-management/index.md" >}}), I'm actually defining that in a `$HOME/.default-python-packages` file so that it's installed by default in every Python.
But regardless, you can then tell the Python extension in VS Code to use black as it's code formatter.

{{< figure src="configure-black.png" title="Change format settings in VS Code" >}}
