---
title: Task for automation
date: 2023-02-11T17:08:20-07:00
tags: [automation, tasks]
toc: true
series:
    - SQLite and Go
summary: Using `task` as a Make alternative for your automation tasks and wonderment.
mermaid: false
mathjax: false
draft: false
---

## `Make`-ing things vs. general purpose tasks

Make is a tool use to build and transform source code.
It excels at keeping track of input files and output files from build steps, and over time it's been used (by me!) as more of a general purpose task tool.
A seminar read for me, coming from the geospatial side, was [Mike Bostock's 2013 article][1] wherein he showed how to benefit from the dependency graph of 'tasks' to get stuff done.
That was a game changer.

But over the years it has also felt like a hassle in terms of the special syntax for handling variables and the Bash-like-but-exactly-bash syntax for strings.
And ultimately I found myself just wanting a way to run 'tasks' rather than file and code transformations specifically.
Something more general purpose.
I've toyed with using more dynamic scripting-style languages for automation, but to be honest the idea of installing all of Ruby for a Rake file or Python for something like a `setup.py` seemed like a massive overhead.
Especially if the project does not call for either of those languages.

## Enter `Task` for Tasks

On more recent projects I've been trying to use and learn Go.
No particular reason other than I like the idea of a single distributable binary, and I'm a crap programmer so statically typed languages that fail at compile time are better for me (and you!).
And while searching the web for a decent Go-based 'task runner'-type utility I came across [Task][2].
`task` is a utility written in Go, and I can't do much better than their own intro to explain why it promised to scratch my itch so perfectly:

> Task is a task runner / build tool that aims to be simpler and easier to use than, for example, GNU Make.
>
> Since it's written in Go, Task is just a single binary and has no other dependencies, which means you don't need to mess with any complicated install setups just to use a build tool.

Well that fits the bill!
The basic premise is that you write a YAML file called a `Taskfile.yml` in your project directory, then run the `task [taskname]` command to get it done.
The major painpoint it removes for me is a much more modern and consistent way to handle strings, data, variables, and dependencies  between tasks when compared to Make.

## Installation

I'm running a Mac right now, so the [canonical way to install](https://taskfile.dev/installation/) is using Homebrew:

```sh
brew install go-task/tap/go-task
```

But since I'm already running Go ([using `asdf`]({{< ref "blog/2021/03/07/asdf-for-runtime-management/index.md" >}})) I found the Go-based approach simpler:

```sh
go install github.com/go-task/task/v3/cmd/task@latest
```

> NOTE: I did also install the [shell completions](https://taskfile.dev/installation/#zsh) which just make everything that much nicer.

## My setup

I'm working on a learning project called `invest` right now.
It's a little website that depends on some YAML file downloading, processing, sticking into SQLite, and then consuming via a Go HTTP server with a little frontend.
There are several steps that I repeat frequently while working on this project.
A good time to write my first `Taskfile.yaml`!
Here's what I've got:


{{% code file="Taskfile.yaml" lang="yml" %}}

So I can run `task --list` or just `task` to see what's available to me:

```sh
$ task                                                                               invest -> main
task: Available tasks for this project:
* build:            Build the binary
* clean:            Clean up all generated files including databases
* db:               Converts the YAML employee file to SQLite
* fetch-data:       Fetches employee / team data from a git repo.
* parse:            Parse existing YAML data files into CSVs that can be imported to SQLite
* test:             Runs Go tests. Use `--` followed by any args to pass, e.g., `-- -v`
task: Task "default" does not exist
```


## Taskfile Details


There's a fair amount going on in that but ultimately it's pretty simple and even has a lot of the same top-level 'tasks' that I typically use in a Makefile.
Here are the things worth paying attention to.

1. `vars` are simple key/value pairs and don't have a bunch of single- or double-quotes to worry about, courtesy of YAML.
1. `vars` are referred to by their name with a preceding `.` so `TAGS_CSV` becomes `.TAGS_CSV`.
1. String interpolation relies on the conventions in Go's [`text/template`](https://pkg.go.dev/text/template) standard library. So if you know how to write Go templates you're done, and they not hard to learn.
   If you look at the monstrosity of a [`yq`][3] call on line 39, for example, you see that I just need to use `{{ .INVEST_DATA }}` to make things work.
   No weird double-quotes (or is it single-quotes?) that Make would require.
1. `tasks` have descriptions, commands, dependencies, and statuses.
1. `tasks` can be `internal` meaning they don't show up on the list of possible tasks at the command line, and you also cannot run them explicity.
   This keeps the file cleaner.
   Case in point, checkout line 72 where the `tmp-dir` task is `internal: true`.
1. `cmds` are nothing more than commands you would run in your shell.
   So if something runs how you want it to in your shell, there's a _really_ high probability that it'll Just Work in a `cmd`.
   That's a radically better experience over my typical Make tribulations.
   Yes, you have to understand the Go templating, but again that seems really predictable to me.
1. Status. Like Make, you often don't want to run a task unless you need to. That's what the `status` instruction does on line 26-27.
   I do not want to download the employee data again if I already have it.
   So the `test -f the-data-file` returns true if I have the file, and the `fetch-data` command doesn't run any of the `cmds`, saving me some time and bandwidth.
1. `deps` (dependencies) can be declared and **run in the order that they are listed**.
   That's worth repeating because, naturally, I forgot that I read that after reading the docs and was scratching my head for a while.
1. `cmds` are composable. Look at line 48. That's where I am calling the `parse` task from within by `db` task.
   Again, order is important.
   To be honestly, I should probably make `parse` an `internal: true` task, but it was such a bugger to get that `yq` stuff working that I wanted to have it handy just by typing `task parse`.
1. `CLI_ARGS` is your typical `--` magic way to inject extra stuff into a command.
   For example at line 62 you can see me leaving the option for adding any `go test` options.
   I'd do that by saying `task test -- -v`, which would pass the `-v` (verbose) argument seamlessly into my test step.0

## More to discover

[Task][2] is also incredibly well documented, and I see plenty of options for future expansion.
For example, [the Go-inspired `defer` keyword](https://taskfile.dev/usage/#doing-task-cleanup-with-defer) is a lovely addition.
And the [general approach to avoiding expensive work](https://taskfile.dev/usage/#by-fingerprinting-locally-generated-files-and-their-sources) is well thought-out.
I encourage you to take a look.
[Task][2] is not only cross platform, single-binary, easy installation.
It is also a focused, simple, and pleasant experience...especially when compared with Make.

[1]: https://bost.ocks.org/mike/make/
[2]: https://taskfile.dev
[3]: https://mikefarah.gitbook.io/yq/

