---
title: "launchd PATH whack-a-mole"
date: 2026-04-04T11:00:00-06:00
tags: [macos, launchd, asdf, tooling]
toc: false
series: []
summary: macOS Launch Agents have a minimal PATH. Here's how to stop playing whack-a-mole every time you add a new tool.
draft: false
---

While setting up [Caddy and Tailscale on reboot]({{< ref "/til/2026/04/04/caddy-and-tailscale-on-reboot" >}}), I kept hitting "command not found" errors from my Launch Agent. This is the story of fixing them one at a time until I found a better approach.

## The problem

macOS Launch Agents run with a minimal `PATH`---basically `/usr/bin:/bin:/usr/sbin:/sbin`. Anything installed through Homebrew, [ASDF](https://asdf-vm.com/), or into `~/.local/bin` doesn't exist as far as launchd is concerned.

My Argus build script needs `npm` (Homebrew), `go` (ASDF), and the Node server it spawns needs `claude` (`~/.local/bin`). None of those are on launchd's default PATH.

## Round 1: hardcode it in the plist

My first fix was adding `PATH` to the plist's `EnvironmentVariables`:

```xml
<key>EnvironmentVariables</key>
<dict>
    <key>PATH</key>
    <string>~/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
</dict>
```

That got Homebrew tools and `claude` working. Ship it.

## Round 2: ASDF enters the chat

Then the build failed because it couldn't find `go`. I manage Go through ASDF, and the shims live in `~/.asdf/shims`---which wasn't in my hardcoded PATH. I could have added it, but I was starting to see the pattern: every time I add a new tool or switch version managers, I'd need to remember to update the plist too.

That's whack-a-mole.

## The fix: let the script own its environment

Instead of cramming PATH entries into the plist, I moved the environment setup into the build script itself and removed `EnvironmentVariables` from the plist entirely.

{{% code file="argus-build.sh" lang="bash" %}}

The script sources `brew shellenv` and adds the paths it needs. If I switch from ASDF to [mise](https://mise.jdx.dev/) next month, I update one script---not a plist buried in `~/Library/LaunchAgents`.

The plist stays clean:

{{% code file="com.user.argus.plist" lang="xml" %}}

No `EnvironmentVariables`. The plist's only job is telling launchd what to run and when.

## Why not source `.zshrc`?

You could have the script run `source ~/.zshrc` to get the full shell environment. But `.zshrc` tends to accumulate interactive-only stuff---prompt themes, key bindings, completion setup---that either fails or prints warnings when sourced non-interactively. Sourcing just what you need is more predictable.

## Reloading

If you change a plist, launchd doesn't notice until you unload and reload it:

```sh
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.user.argus.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.user.argus.plist
```

But since the PATH setup now lives in the script, most changes don't require touching the plist at all. Just edit the script and restart the service:

```sh
launchctl kickstart -k gui/$(id -u)/com.user.argus
```
