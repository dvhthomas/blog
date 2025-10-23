---
title: GitHub CLI
date: 2023-02-11T18:28:32-07:00
tags: [authentication, github, api, curl]
toc: true
series:
    - SQLite and Go
summary: Using the GitHub CLI to make authenticated and authorized download from a private repo.
mermaid: false
mathjax: false
draft: false
---

## The GitHub `gh` CLI rocks

While [working on a side project]({{<ref "/blog/2023/02/11/taskfile/index.md" >}}) I needed to download a file containing some data to process.
The issue? It was on a private GitHub repo within my organization (which also happens to be GitHub!).
I was dreading the usual song-and-dance around getting that file using various auth mechanisms but then realized that the [GitHub CLI tool][1] can actually do that already.

> NOTE: I was using this inside a `Taskfile.yaml` file that you can read more on the linked blog post above.
> Ignore the `{{ }}` bits...that's just string interpolation.

### Where is the file?

Step one is to consult the GitHub API to figure out the correct name of the file.
Because the API refers to things differently that the path you see in the URL for repo browsing.
Here's what I ended up with:

```
https://api.github.com/repos/github/thehub/contents/docs/_data/hubbers.yml
```

1. `api.github.com/repos` -- that bit is consistent.
1. `github` -- fooled you! I work at GitHub, so that's the _name of my organization_.
   The name of a typical repo at work is `www.github.com/github/the-repo-name`. See the `github` bit in there?
   That's **my** organization, not your favorite Git hosting website!
1. `thehub` -- that's the name of our internal repo where we keep our intranet The Hub.
   Replace with _your_ repository name.
1. `contents` -- use that. It's a consistent part of the API name for your files in your repo.
1. `docs/_data/hubbers.yml` -- that is the directory/filename of something in **my** repo.
   So replace that with whatever it is you want to download.

That is all probably superbly well documented somewhere.
But it took me an age to figure it out (and the org name GitHub didn't help!!!!)

So now to the actual download.

```sh
curl $(gh api {{.EMPLOYEE_SOURCE}} --jq .download_url) --output {{.EMPLOYEE_DATA}}
```

1. `EMPLOYEE_SOURCE` is the full URL from above. You could just type that whole thing out or use an environment value.
   Again, I'm using `Taskfile.yaml` syntax so cut'n'paste will not work in your shell.
1. `EMPLOYEE_DATA` is just where I want `curl` to save the file.
1. The `--jq .download_url` is **MAGIC**. That's the bit that yanks out just the URL of the file you need to download.
   When the `gh api URL` bit runs, it gets a JSON response from the GitHub API.
   We only need the actual file URL, not the other metadata and bits.
   So that whole `$(gh api...)` bit is just to get the _real_ URL of the file resource I want.


So you tried that and it failed?! Yeah, me too.
AuthN will get you every time. You have to remember that in order to 'act as Dylan' the `gh` CLI tool needs to know I'm Dylan.

```sh
gh login
```

With that taken care of, `gh` is happy and `curl` gets the URL to the file I want.


[1]: https://cli.github.com

