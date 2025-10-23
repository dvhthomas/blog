---
title: asdf for Runtime Management
date: 2021-03-07T12:37:59-07:00
tags: [tools, python, java, mac]
toc: true
series: []
summary: |-
    Using `asdf` as an alternative to homebrew for managing
    language runtimes like Python and Ruby. It provides a holistic solution
    to the same problem that `pyenv` and `nvm` and `rvm` solve for specific
    languages and runtimes.
mermaid: false
draft: false
---

## Papercuts with multiple runtime versions

I've been struggling to keep Python healthy on my Mac, mostly due to versions that update when I use `brew update` or `brew install ...` on a tool that requires a specific Python version.

[A thread on Hacker News](https://news.ycombinator.com/item?id=26017852) captures the issue well.

And there are solutions: I'm familiar with [`pyenv`](https://github.com/pyenv/pyenv) and how it can help manage Python versions more effectively than Homebrew.
But then I find myself doing something similar for Nodejs.
Not to mention the occasional need for Java's OpenJDK.

In short, I could start using multiple language and framework-specific version managers, or I could look for something more unified.

## asdf in a Nutshell

That's when I came across [a thread about asdf](https://hackercodex.com/guide/python-development-environment-on-mac-osx/) and how it may solve this issue.

[asdf] is an extendible version manager to _"Manage multiple runtime versions with a single CLI tool"_.

It solves the same problem as pyenv and nvm and rvm and...
The nice thing is that it does it holistically and with a consistent CLI.

## Up and running

Ironically, the best way to get asdf up and running on a Mac is to use Homebrew:

```shell
brew install coreutils curl git
brew install asdf
```

Now you can teach your shell about [asdf].
I’m using zsh so getting it working involves the [asdf zsh plugin][1].
You basically just need to add `plugins=(asdf)` to your `.zshrc` file, after
which source can `source ~/.zshrc` to get things running.

Before you start installing frameworks, remove any existings tools that are doing 
the same thing.
For example, I'm using `pyenv` so I followed the instructions to completely removed it from my system **before** attempting to install any asdf plugins:

```shell
rm -rf $(pyenv root)
brew uninstall pyenv
brew clean
```

## Install plugins

[asdf] uses the concept of plugins to isolate you different languages.
Plugins are all hosted on Github, so adding a plugin involves pointing the asdf tool to the canonical location of each plugin and installing it.
For some plugins that are widely used, providing the name of the plugin alone is enough.
For example, getting the Python plugin is as simple as:

```shell
asdf plugin-add python
```

That's the `plugin-add` subcommand followed by the name of the plugin `python`.

Whereas for Java's OpenJDK you'll provide a full URL after the name of the plugin (`java` in this case):

```shell
asdf plugin-add java https://github.com/halcyon/asdf-java.git
```

The net result is the same.

## Install versions

Installing a version is very, very easy.
The [`install`](https://asdf-vm.com/#/core-manage-versions?id=install-version) sub-command minimally takes a plugin name like `java` and the specific version you want.

First look up all of the possible versions of a particular frameworks.
For example, I wanted to see which versions of Python were out there, so I ran:

```shell
asdf list all python | less
```

I didn't pipe to `less` and first, but the list was so overwhelming that it helped me digest the results and make my choice.
This was even more the case with the OpenJDK versions, because the version numbering is [so complicated](https://jdk.java.net/archive/) to a non-Java regular like me.

After figuring out what I wanted, here's how we get Python 3.9.2 and the OpenJDK 15.0.2 (7) installed as completely isolated versions ready for our use:

```shell
asdf install python 3.9.2
asdf install java adoptopenjdk-15.0.2+7
```

> There’s [more configuration possible for Java](https://github.com/halcyon/asdf-java) if needed to make it play nicely with MacOS.
> Specifically:
> - set JAVA_HOME properly add this to your `.zshrc`: `. ~/.asdf/plugins/java/set-java-home.zsh`
> - Make sure Mac native apps work with the correct Java: `java_macos_integration_enable = yes`

Running `which python` on my terminal tells me that it worked:

```shell
/Users/thomas/.asdf/shims/python
```

And use `asdf list python` or `asdf list java` or even just `asdf list` to see what you have installed:

```shell
$ asdf list
java
  adoptopenjdk-15.0.2+7
python
  2.7.18
  3.9.2
```

Where did that Python 2 come from? We'll get to that in a minute.

## Setting versions

The whole point of supporting multiple versions of a language is that you probably need to switch versions in a predictable manner.
asdf provides for this.

For example, to set the global (system default) version, use the `global` sub-command.
Let's do that for Python and Java.
And if you need to remember which versions, just run that `asdf list` command again.

```shell
asdf global python 3.9.2
asdf global java adoptopenjdk-15.0.2+7
```

Running `python -V` and `java --version` will let you know that you have the correct global defaults now.

But what if you need a default Python 3 and a default Python 2?

First install a Python 2:

```shell
asdf install python 2.7.18
```

Now run that same `asdf global` again but this time **pass in two Python versions**, starting with the default one:

```shell
asdf global python 3.9.2 2.7.18
```

The asdf documentation goes into the fallback mechanism, but basically you'll get sensible answers to version requests, thus:

```shell
$ python -V  # default to Python 3 if no version is specified
Python 3.9.2
$ python3 -V # and force Python 3 if specified
Python 3.9.2
$ python2 -V # and enable Python 2 specifically
Python 2.7.18
```

If you needed to default to Python 2 you for `python` then you would just switch the order in which you specific global Pythons.

## Setting temporary and local versions

asdf [has you covered](https://asdf-vm.com/#/core-manage-versions?id=set-current-version) for two other common use cases:

### Temporary version

If you need a specific version just for the lifetime of a shell, try:

```shell
asdf shell python 2.7.18 # or whatever you need
```

### Project-specific or local version

The `local` subcommand handles what is probably my most important need: changing to the correct Python version when working in a project directory.
For example, if my `fizzbuzz` project directory should use Python 2 for some reason, then I'd do this:

```shell
cd fizzbuzz
asdf local python 2.7.18
```

That writes an asdf-managed file called `.tool-versions` to the fizzbuzz directory.
When I `cd` into that directory and type `python`, [asdf] automatically figures out that I really mean `/Users/thomas/.asdf/shims/python2` and does what I'd expect.

## Tips for the uninitiated

I came across of a couple of things that are well-documented but caught me out because I...ahem...did not read the documentation.

### Existing virtual environments must go

When attempting to use a freshly installed [asdf] version of Python with an existing virtualenv, bad things happened. Or more to the point, nothing happened at all.
Running `pip3 install -r requirements.txt` failed to install the right bits in the correct place.

The fix was simple: zap the virtual environment and start over.
I create my `virtualenv`s like this in Python

```shell
cd project-folder
python3 -m venv .venv
```

So starting over was a trivial:

```shell
cd project-folder
rm -rf .venv
```

Now redoing my `venv` setup worked just fine.

### Install default packages

You can install default packages to any new Python.
Create a file `$HOME/.default-python-packages` and add package definitions exactly as you would for a `requirements.txt` file for `pip` to install.
For example, I use `black` to format code so I always want that handy:

```txt
black
```

### Teach asdf about new binaries

If you run `pip` or any other framework-specific package manager that installs a runnable tool (like pip itself or a Nodejs package that has a CLI), you need to tell asdf about it.
This is called 're-shimming'.
It's very easy to do, and very easy to forget!
So if you've installed something like `sqlite-tools` using `pip3` and then get a response to types `sqlite-tools` like _"I have no idea what you're talking about, dear user", try typing this:

```shell
asdf reshim python
```

That should get you back on track.

## Summary

I really like asdf.
There are framework specific things to learn (Java vs. Python for example), but overall the CLI does a nice job of smoothing over those differences.

I'll be sticking with this new tool to see--over time--whether the papercuts of framework version management get fewer and farther between.

[asdf]: https://asdf-vm.com
[1]: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/asdf
