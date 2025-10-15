---
title: uv for LLM Experiments
date: 2025-10-14T10:46:24-06:00
tags: [uv, python, tooling]
toc: true
series: [AI Engineering Course]
summary: Using `uv` instead of Anaconda `environment.yml` to set up a virtual environment for LLM experiments.
mermaid: false
mathjax: false
draft: false
images: [pyproject.png]
---

{{< figure src="pyproject.png" title="pyproject.toml for an LLM project" >}}

I'm a `uv` convert.
It's a much faster way to set up isolated virtual environments for Python than other methods that I've used, including Anaconda and the `venv` + `pip` combination.

## Anaconda Baseline

For my current course on AI Engineering [the code expects](https://github.com/bytebyteai/ai-eng-projects/tree/main/project_2) the environment to be fully managed using [Anaconda](https://www.anaconda.com).
I have zero problem with that.
It's all nicely packaged up in a single file:

{{% code file="environment.yaml" lang="yaml" %}}

It's all very clear what this project relies on.
But I don't use Anaconda: I use [asdf]({{< relref "tags/asdf" >}}) to manage languages and runtimes, including Python.
And I've started using uv for my Python projects.

### Using the right Python

First I use `asdf` to install the right Python version.
I decided to use a more recent version of Python that the Anaconda baseline.

{{< highlight bash "hl_lines=4" >}}
asdf install python 3.14.0
...
cd ~/projects/ai-eng-projects/project_2
asdf set python 3.14.0
{{</ highlight>}}

The last line sets the Python version for the current directory by creating a `.tool-versions` file:

```python
python 3.14.0
```

If you want to use `uv` to manage your Pythons, you can totally do that by [following their detailed instructions](https://docs.astral.sh/uv/concepts/python-versions/#requesting-a-version).
I use `asdf` for all of my languages and runtimes, so I prefer to use it for setting project-local versions.
Here's that Python version for my project:

{{< highlight bash "hl_lines=11" >}}
$ asdf list
flutter
 *3.35.1-stable
golang
 *1.24.4
nodejs
 *24.2.0
python
  3.13.4t
  3.13.5
 *3.14.0
  anaconda3-2025.06-1
rust
  1.89.0
 *1.90.0
{{</ highlight>}}


## Adding `uv` Support

I working in an [existing git repository](https://github.com/bytebyteai/ai-eng-projects/tree/main/project_2) that I don't want to litter with all kinds of `uv`-isms, like a new README.md or a dedicated directory.
I just want to use `uv` alongside my `asdf`-managed Python versions.

### Basic Configuration

First, let's use `uv` in the most minimal way possible:

```sh
$ uv init . --bare
Initialized project `project-2` at `/Users/bitsbyme/projects/ai-eng-projects/project_2`
```

This does exactly one thing: it creates a basic project file in the _current_ directory (`.`) rather the the typical behaviour of creating a new directory:

{{% code file="toml-bare.toml" lang="toml" %}}

### Add Dependencies

This is where I think `uv` shines: it's incredibly fast to detect, resolve, and install dependencies.
`pip` just takes an age in the build process once it's downloaded whereas `uv`, as far as a understand, has prebuilt binaries for the dependencies.

First attempt:

```sh
$ uv add "langchain==0.3.25" "langchain-community==0.3.24" "sentence-transformers==4.1.0" "streamlist==1.45.1" "openai==1.79.0" "faiss-cpu==1.11.0" "unstructured==0.17.2"
Using CPython 3.13.5 interpreter at: /Users/bitsbyme/.asdf/installs/python/anaconda3-2025.06-1/bin/python3
Creating virtual environment at: .venv
  × No solution found when resolving dependencies:
  ╰─▶ Because streamlist was not found in the package registry and your project depends on
      streamlist==1.45.1, we can conclude that your project's requirements are unsatisfiable.
  help: If you want to add the package regardless of the failed resolution, provide the
        `--frozen` flag to skip locking and syncing.
```

Oh jeez. I misspelled `streamlit`!
But hey, and least `uv` created a virtual environment for me!

Let's try again:

```sh
$ uv add "langchain==0.3.25" "langchain-community==0.3.24" \
  "sentence-transformers==4.1.0" "streamlit==1.45.1" "openai==1.79.0" \
  "faiss-cpu==1.11.0" "unstructured==0.17.2"
Using CPython 3.13.5 interpreter at: /Users/bitsbyme/.asdf/installs/python/anaconda3-2025.06-1/bin/python3
Creating virtual environment at: .venv
Resolved 138 packages in 3.63s
      Built langdetect==1.0.9
Prepared 64 packages in 43.27s
Installed 119 packages in 778ms
 + aiofiles==25.1.0
 + aiohappyeyeballs==2.6.1
 + aiohttp==3.13.0
 ...
 ... lots and lots of dependencies
 ...
 + webencodings==0.5.1
 + wrapt==1.17.3
 + yarl==1.22.0
 + zstandard==0.23.0
```

So this whole thing just took less that one minute to fetch the same things that Anaconda expects, including a build of one library that hadn't been cached in advance.
If you want to read all the gory details, run `uv tree` and get a sense for the sheer number of dependencies that were installed.
If you _really_ want to know what the project depends on, `uv` did also create a `uv.lock` file.
It's dense!

### Using `uv`

If I were to check in my changes to the git repo, they'd be quite modest:

{{< highlight bash "hl_lines=5-7" >}}
$ git status
On branch uv
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        project_2/.tool-versions
        project_2/pyproject.toml
        project_2/uv.lock

nothing added to commit but untracked files present (use "git add" to track)
{{</ highlight >}}

Three files that will let a subsequent contributor to do the following.

1. Install uv.
2. Set up the correct Python and virtual environment.
   That could be with asdf, uv, or whatever makes you happy.
3. Run `uv sync` and get _blazing fast_ results.

If you discover that there's a missing dependency, `uv add ...` comes to the rescue, and you'd commit the updated `pyproject.toml` and `uv.lock` to your repo.

## Conclusion

There's nothing wrong with Anaconda, but it's not the only way to manage Python projects.
`uv` is a lightweight alternative that can be used to manage Python projects their dependencies.
