---
title: Caddy + Tailscale for Remote File Serving
date: 2026-04-02
tags: [networking, webserver, tailscale, macos]
toc: false
series: []
summary: Serving a local HTML file over your tailnet with Caddy, Tailscale, and a macOS LaunchAgent.
draft: false
images: []
---

I wanted to serve a local HTML file and access it from my phone via [Tailscale](https://tailscale.com/). I already knew [Caddy as a quick file server]({{< ref "/til/2026/01/23/caddy-file-server" >}}), so the manual version was two commands:

```bash
caddy file-server --browse --listen :8080 --root "/Users/me/My Job Search/kanban"
tailscale serve --bg 8080
```

Page is now at `https://<machine-name>.<tailnet>.ts.net`. Tailscale handles HTTPS. The [full guide is here](https://jobs4me.org/guides/remote-access/).

## Surviving reboots

`tailscale serve --bg` persists on its own. Caddy needs a macOS LaunchAgent. I created `~/Library/LaunchAgents/com.jfm.caddy.plist` that runs `caddy run --config /path/to/Caddyfile`, with `RunAtLoad` and `KeepAlive` set to true. Load it with `launchctl load`.

The Caddyfile itself is minimal:

```text
:8080 {
    root * "/Users/me/My Job Search/kanban"
    file_server
}
```

A Caddyfile isn't strictly necessary for this --- the CLI one-liner works fine. I only used one because the LaunchAgent plist was getting unwieldy with every CLI argument as a separate `<string>` element.

## The learning: paths and spaces

Three contexts, three different quoting rules, all demanding absolute paths:

- **CLI:** quoted shell string works --- `--root "/Users/me/My Job Search/kanban"`
- **Caddyfile:** must be a quoted absolute path. `~` doesn't expand, relative paths silently fail.
- **Plist XML:** each arg is its own `<string>` element so spaces are fine, but still no `~` expansion. The binary must be `/opt/homebrew/bin/caddy`, not just `caddy`.

Debug with `cat /tmp/jfm-caddy.log` and `launchctl list | grep jfm`.
