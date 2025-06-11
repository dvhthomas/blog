---
title: 2021-08-31
date: 2021-08-31T09:12:27-06:00
tags: [tools, direnv]
toc: true
series: []
summary: Using `direnv` to automatically handle environment variables.
mermaid: false
mathjax: false
draft: false
---

## Changing environments per directory

While discussing `tmux` as a tool with a colleague the question came up: could we automagically switch the `gcloud` configuration when switching between `tmux` sessions?

For example, I have a `tmux` session for a project called TrainTrack.
When I'm working on that project I'd like to have my `gcloud` config point to a specific GCP project.

And when I switch `tmux` sessions to work on my `dispatcher` project, I similarly want to have the `gcloud` configuration switch---_automatically_---to the relevant GCP project.

You can achieve this manually by setting an environment variable called `CLOUDSDK_ACTIVE_CONFIG_NAME`, so what I need is a way to change that ENV variable automatically when I switch working directories.

### `direnv`

The [Google documentation](https://cloud.google.com/sdk/docs/configurations#automating_configuration_switching) points to [`direnv`](https://direnv.net/) as a viable solution.

It uses the presence of a `.envrc` file in a directory to trigger loading and unloading and resetting ENV values.

#### Installation

Piece of cake on Mac: `brew install direnv` then [integrate into your shell](https://direnv.net/docs/hook.html#zsh).

#### Setup

I'm using `tmux` so I created a session where I have two project directories open, one per pane.
My goal is to be able to simple switch between panes in the same `tmux` session and have the `gcloud` configuration change automatically.

Pane #1 - I'm in a directory called `traintrack`:

```sh
echo "CLOUDSDK_ACTIVE_CONFIG_NAME=ttrack" > .envrc
```

At this point `direnv` let me know that it needs permission to automatically update environment variables:

```sh
direnv allow
```

Pane #2 - directory for my 'dispatcher' project that needs a different `gcloud config`. Note the different value for the `CLOUDSDK_ACTIVE_CONFIG_NAME` variable that the `gcloud` command is watching for:

```sh
echo "CLOUDSDK_ACTIVE_CONFIG_NAME=dispatcher" > .envrc
direnv allow
```

#### Proving it out

With `tmux` open and two panes side-by-side I start in pane #1:

```sh
$ gcloud config list
[core]
account = dylan.thomas@woolpert.com
disable_usage_reporting = True
project = fleetrouting-app-dev

Your active configuration is: [dispatcher]
```

Bingo! I have the correct configuration `[dispatcher]` for this project directory.

Then switch to Pane #2 and run the same command:

```sh
gcloud config list
[core]
account = dylan.thomas@woolpert.com
disable_usage_reporting = True
project = demos-landing-site-quenthal

Your active configuration is: [ttrack]
```

And yes! Without doing anything at all I have the correct and expected `gcloud` configuration with the right project, etc.

I can see this being really useful for [configuring 12 Factor apps](https://12factor.net/config).

## Now with .env support

I was setting this up on a new machine recently and wanted `direnv` to just use my existing `.env` file rather than the `.envrc` file.
As of my testing in June 2025 this is possible but requires adding a configuration file to explicitly allow it:

Create a file called `~/.config/direnv/direnv.toml` with the following content:

```toml
[global]
load_dotenv = true
```

Now you'll still get the same request to `direnv allow` but you don't have to create a `.envrc` file.
