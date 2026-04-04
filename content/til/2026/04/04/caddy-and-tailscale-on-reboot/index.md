---
title: Caddy and Tailscale on reboot
date: 2026-04-04T10:00:00-06:00
tags: [caddy, tailscale, macos, launchd, tooling]
toc: false
series: []
summary: Getting Caddy and Tailscale to serve multiple local apps on reboot without thinking about it.
draft: false
---

I run [Argus](https://github.com/antonioromano/code-orchestrator) on my Mac Mini to manage AI coding sessions, and I need to reach its dashboard from my laptop while things are running. I also have a [kanban board](https://jobs4me.org/guides/remote-access/) (a static HTML file) that I check on my phone. Both apps run on the Mini on different ports. I wanted each one at a clear, memorable URL---`/jobs` and `/argus`---accessible from any device on my tailnet, and I wanted it all to survive a reboot.

> INFO: [Tailscale](https://tailscale.com/) is a mesh VPN built on WireGuard. You install it on your devices and they form a private network called a tailnet. Any device on your tailnet can reach any other device by name, with automatic TLS, without opening ports to the internet.

This builds on two earlier posts: [Caddy as a quick file server]({{< ref "/til/2026/01/23/caddy-file-server" >}}) and [Caddy + Tailscale for remote file serving]({{< ref "/til/2026/04/02/caddy-tailscale-remote-access" >}}). This time I needed path-based routing to multiple backends, not just serving a single directory.

## The problem

Two things made this harder than it looks:

1. Argus has a Node server for its API and WebSocket connections, plus a Vite-built SPA for the frontend. In production I don't want to run a Vite dev server---I want to serve the built static files and proxy API requests to the Node server.
2. The Vite build hardcodes asset paths at the root (`/assets/index-xxx.js`), not under the subpath (`/argus/assets/...`). So hitting `/argus` in the browser loads `index.html`, but every subsequent request for JS, CSS, API calls, and WebSocket connections arrives at a root-level path. You can't just use a single `/argus*` handler in Caddy---you need separate handlers for `/assets`, `/api`, and `/socket.io` at the root.

## The fix: let Caddy own the routing

Caddy handles all the path-based routing on a single port. Tailscale just points at that one port.

The `Caddyfile`:

{{% code file="Caddyfile" lang="caddy" %}}

Port 8080 keeps the jobs board accessible locally. Port 8777 is what Tailscale sees. The `/jobs` handler strips the prefix and serves static files. The `/argus` handler strips the prefix and serves the Vite build output, falling back to `index.html` for client-side routing. Then `/assets`, `/api`, and `/socket.io` each get their own root-level handler because that's where the browser actually requests them.

Tailscale setup is one command:

```sh
tailscale serve --bg 8777
```

That's it. Tailscale terminates TLS and proxies everything to Caddy on 8777.

## Surviving a reboot

I keep the actual plist files and scripts in `~/tools` alongside other local config, then symlink the plists into `~/Library/LaunchAgents/`:

```sh
ln -s ~/tools/com.user.caddy.plist ~/Library/LaunchAgents/
ln -s ~/tools/com.user.argus.plist ~/Library/LaunchAgents/
```

This way the plists live somewhere I'll actually find them again, not buried in a `LaunchAgents` directory I never look at.

The Caddy plist is straightforward---just run the binary with the config file:

{{% code file="com.user.caddy.plist" lang="xml" %}}

Argus uses a build script that compiles the Vite frontend then starts the Node server. Rather than running the Vite dev server in production, Caddy serves the static files directly from `client/dist`---no Vite process needed:

{{% code file="argus-build.sh" lang="bash" %}}

And its plist:

{{% code file="com.user.argus.plist" lang="xml" %}}

You might notice the Argus plist has no `EnvironmentVariables` block for `PATH`. That's deliberate---the build script sets up its own environment. I wrote up [the saga of getting there]({{< ref "/til/2026/04/04/launchd-path-whack-a-mole" >}}) separately.

Load them once:

```sh
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.user.caddy.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.user.argus.plist
```

Tailscale Serve with `--bg` persists its config across restarts automatically.

## The result

After a reboot, everything comes up on its own:

- **localhost:5400** --- Argus API server
- **localhost:8080** --- kanban board directly
- **https://machine.tailnet.ts.net/argus** --- Argus via Tailscale
- **https://machine.tailnet.ts.net/jobs** --- kanban board via Tailscale

For development, `npm run dev` runs the Vite dev server on port 5173 with its own proxy to the API server---completely independent of the production setup.

## Gotchas

- **`launchctl load` caches the plist.** If you edit a plist, you must `launchctl bootout` then `bootstrap` again---just restarting the process doesn't re-read the file.
- **Vite builds hardcode root-level asset paths.** You can't serve a Vite SPA at a subpath with a single Caddy `handle_path` rule. You need separate handlers for the assets, API, and WebSocket paths that the built HTML references. The alternative---building with `base: '/argus/'`---would break local dev.
