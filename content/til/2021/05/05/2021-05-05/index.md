---
title: 2021-05-05
date: 2021-05-05T17:59:13-06:00
tags: [linux, python, asdf]
toc: true
series: []
summary: Getting Python running on fresh Linux
mermaid: false
mathjax: false
draft: false
---

## Problem - unhappy Python

I was setting up a new Ubuntu machine today and was using `asdf` to get me there.
`asdf install python 3.9.5` complained that various dependencies for Python extensions like bz2 and OpenSSL were missing.

{{< highlight bash "hl_lines=6-7" >}}
$ sudu install python 3.9.5
python-build 3.9.5 /home/dylan/.asdf/installs/python/3.9.5
Downloading Python-3.9.5.tar.xz...
-> https://www.python.org/ftp/python/3.9.5/Python-3.9.5.tar.xz
Installing Python-3.9.5...
WARNING: The Python bz2 extension was not compiled. Missing the bzip2 lib?
WARNING: The Python readline extension was not compiled. Missing the GNU readline lib?
ERROR: The Python ssl extension was not compiled. Missing the OpenSSL lib?

Please consult to the Wiki page to fix the problem.
https://github.com/pyenv/pyenv/wiki/Common-build-problems


BUILD FAILED (Ubuntu 21.04 using python-build 1.2.27-7-g1edded34)

Inspect or clean up the working tree at /tmp/python-build.20210505173738.7298
Results logged to /tmp/python-build.20210505173738.7298.log

Last 10 log lines:
	 ./python -E -m ensurepip \
		$ensurepip --root=/ ; \
fi
Looking in links: /tmp/tmp269bylh7
Processing /tmp/tmp269bylh7/setuptools-56.0.0-py3-none-any.whl
Processing /tmp/tmp269bylh7/pip-21.1.1-py3-none-any.whl
Installing collected packages: setuptools, pip
  WARNING: The scripts pip3 and pip3.9 are installed in '/home/dylan/.asdf/installs/python/3.9.5/bin' which is not on PATH.
  Consider adding this directory to PATH or, if you prefer to suppress this warning, use --no-warn-script-location.
Successfully installed pip-21.1.1 setuptools-56.0.0
{{</highlight>}}

## Solution - Install prerequisite build tools

After some digging [I found the following](https://stackoverflow.com/a/57609842) combination to get me over the hump:

```sh
sudo apt install build-essential libssl-dev \
  zlib1g-dev libbz2-dev libreadline-dev \
  libsqlite3-dev llvm libncurses5-dev \
  libncursesw5-dev wget curl
```

With that in place this completed successfully:

```sh
$ asdf install python 3.9.5
python-build 3.9.5 /home/dylan/.asdf/installs/python/3.9.5
Downloading Python-3.9.5.tar.xz...
-> https://www.python.org/ftp/python/3.9.5/Python-3.9.5.tar.xz
Installing Python-3.9.5...
Installed Python-3.9.5 to /home/dylan/.asdf/installs/python/3.9.5
```
