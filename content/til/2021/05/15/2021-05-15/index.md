---
title: 2021-05-15
date: 2021-05-15T11:15:47-06:00
tags: [python, spatialite, sqlite, icu]
toc: true
series: []
summary: ICU for Python head-scratcher solved
mermaid: false
mathjax: false
draft: false
aliases: ["/til/2021-05-15/"]
---

This is the yak shaving edition of getting things to work instead of doing work with things.
My least favorite activity.

## Python and ICU

I'm trying to use [`csvkit`](https://csvkit.readthedocs.io/en/latest/) and `numpy` for some tinkering.
But getting them installed on my Mac was giving me fits because one of the core dependencies, ICU ([Internal Components for Unicode](http://site.icu-project.org/home)), just would link properly.

I know that this is all related to the use of Homebrew to install libraries and dependencies, and then ensuring that various `setup.py` scripts and can find the correct versions.
But it was really escaping me how to fix it.

After a lot of trial and error and landed on this recipe.
The first two steps of that absolutely fixed my frustrations: `libicu-dev` and `PyICU` are now happily installed, which paved the way for a flawless `pip3 install csvkit`.
Whew!

{{<gist ddelange 6e04e81b99fae08e817a00515d4a378d >}}

## Spatialite and Python

Spatialite is a loadable extension to SQLite that adds geospatial capabilities to my favorite relational database.
I want to use that for some experimental work with [tax data]({{< ref "blog/2021/05/11/tinkering-with-tax-data/index.md" >}}).
But the version of SQLite that gets installed by default on a Mac **does not** support the ostensibly insecure capability to load extensions at runtime.
So when trying to install Python...which depends 

Bottom line: I needed to get a version of Python installed that was pointing to a version of SQLite that _could_ use loadable extensions, so that my end goal of using Spatialite as a dependency in Datasette could be satisfied.
Still following?!

Anyway, I ultimately found the [solution](https://stackoverflow.com/a/60481356) and with a tiny bit of tweaking I was all set.
I use `asdf` for managing my Python versions, and it using `pyenv`, so the recipe worked well:

```sh
PYTHON_CONFIGURE_OPTS="--enable-loadable-sqlite-extensions --enable-optimizations --with-openssl=\$(brew --prefix openssl)" \
LDFLAGS="-L/usr/local/opt/sqlite/lib" \
CPPFLAGS="-I/usr/local/opt/sqlite/include" \
asdf install python 3.9.5
```

The `--with-openssl=$(brew --prefix openssl)` bit didn't work for me.
Typing that bit on the command line gave expected results:

```sh
$ brew --prefix openssl
/usr/local/opt/openssl@1.1
```

So I just dropped that value into the `--with-openssl` parameter.
With that in place, the installation of Python went great, and then trying to run `datasette --spatial-lite my.db` finally, finally worked.
