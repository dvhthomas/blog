---
title: Up and running with Pi
date: 2026-05-06T22:04:50-06:00
tags: [pi, agents, tools]
toc: true
series: []
summary: Instructions and tips for getting the pi.dev agent harness running on a Mac with 8GB of RAM.
draft: false
images: []
hero_alt:
---

[Pi](https://pi.dev) is a small terminal coding agent in the Claude Code mold, with a plugin ecosystem and support for 15+ providers. I wanted to try it on an 8GB Mac mini---which sounds doomed, but works fine if you put the heavy model somewhere else.

The plan: a tiny local model for offline tinkering, Gemma 4 31B via Ollama Cloud as the daily driver, and Claude through OAuth (so my Pro subscription covers it---no API key, no per-token spend) for the hard turns. Model blobs live on the external drive I keep around for big files, so the internal SSD doesn't fill up.

## What runs where

- **Local small model (Qwen 2.5 Coder 3B).** Offline, autocomplete, simple refactors. Around 2GB resident.
- **Cloud generalist (Gemma 4 31B via Ollama Cloud).** The default. Big context, tools, vision, served from someone else's hardware.
- **Heavy duty (Claude Sonnet via OAuth).** Complex architecture, multi-file edits, deep debugging.

`Ctrl-P` cycles through them inside Pi.

## The 8GB memory budget

Apple Silicon shares RAM and VRAM, so the LLM budget is whatever's left after macOS and your other apps. On 8GB:

- macOS itself takes 4--6GB.
- OrbStack/Docker can eat 2--4GB if you don't cap it.
- Chrome and an IDE will take another 1--2GB.

That leaves maybe 2--4GB of headroom. Qwen 2.5 Coder 3B (~2GB resident) is the floor. Anything bigger means stopping OrbStack first, or reaching for the cloud. Watch Activity Monitor's "Memory Pressure" graph---if it goes yellow or red, you're swapping.

## Prerequisites

```bash
# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Ollama
brew install ollama
```

You also want an external drive with a known mount path---something like `/Volumes/Fast` or `/Volumes/ExternalSSD`.

## Putting model blobs on the external drive

Goal: pull as many models as you want without touching the internal SSD.

Use a symlink, not the `OLLAMA_MODELS` environment variable. On macOS the env var doesn't always reach the GUI Ollama app, so it'll silently keep writing to `~/.ollama/models`. A symlink is the durable fix.

Replace `/Volumes/YOUR_DRIVE` below with your actual path:

```bash
# 1. Stop Ollama
osascript -e 'quit app "Ollama"' 2>/dev/null
pkill -x ollama 2>/dev/null

# 2. Create the target on the external drive
mkdir -p /Volumes/YOUR_DRIVE/ollama/models

# 3. Migrate any existing models (no-op for fresh installs)
[ -d ~/.ollama/models ] && [ ! -L ~/.ollama/models ] && \
  mv ~/.ollama/models/* /Volumes/YOUR_DRIVE/ollama/models/ 2>/dev/null && \
  rmdir ~/.ollama/models

# 4. Symlink
ln -s /Volumes/YOUR_DRIVE/ollama/models ~/.ollama/models

# 5. Verify
ls -la ~/.ollama/models   # should point at /Volumes/YOUR_DRIVE/ollama/models

# 6. Restart and pull the local model
brew services start ollama
ollama pull qwen2.5-coder:3b
```

macOS may prompt for permission to "Access files on a removable volume." Allow it.

The trade-off: if the drive ejects, Ollama can't load local models. Pi just falls back to your other providers, which is fine.

## Install Pi

The official one-liner installs the binary under `~/.pi/bin/pi` and adds a PATH line to your shell rc. It's also the easiest to uninstall later.

```bash
curl -fsSL https://pi.dev/install.sh | sh

exec $SHELL -l
pi --version
```

(There's also `npm i -g @mariozechner/pi-coding-agent` and pnpm/bun equivalents if you'd rather.)

## Wire up the providers

### Local Ollama

`~/.pi/agent/models.json`:

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "models": [
        { "id": "qwen2.5-coder:3b" }
      ]
    }
  }
}
```

### Claude via OAuth

Inside Pi:

```
/login
# pick "Anthropic — OAuth"
# browser opens, sign in with the account on your Pro/Max subscription
```

The token lands in `~/.pi/`. Anthropic models then show up automatically---pick `claude-sonnet-4-6` for daily use.

### Defaults and favorites

`~/.pi/agent/settings.json`:

```json
{
  "defaultProvider": "ollama-cloud",
  "defaultModel": "gemma4:31b",
  "favorites": [
    "ollama-cloud/gemma4:31b",
    "ollama/qwen2.5-coder:3b",
    "anthropic/claude-sonnet-4-6"
  ]
}
```

Default lands on Gemma 4 31B via Ollama Cloud---a real Gemma without the hardware bill. `Ctrl-P` cycles cloud Gemma → local Qwen → Claude.

Two things to know:

- **Cloud needs auth first** (next section). Until that's done Gemma will fail to respond, and you should use Qwen or Claude.
- **Local cold-load is slow.** First time you cycle to local Qwen in a session, the model gets mmap'd into RAM from the external drive and Pi shows "working…" for a few seconds. That's not a hang. Subsequent turns are fast (~40 tok/s warm) as long as the model stays loaded (default keepalive: 5 min).

## Extensions

Pi calls plugins "extensions". Install with `pi install <source>`, list with `pi list`, remove with `pi remove <source>`.

### Ollama Cloud---the big-model escape hatch

This is the most important one for limited-RAM machines. It registers Ollama Cloud as a provider, dynamically fetches the model list (Gemma 4 31B, DeepSeek V3.1, etc.), and adds `ollama_web_search` and `ollama_web_fetch` tools.

```bash
pi install npm:pi-ollama-cloud
```

Auth setup, required before any cloud models appear:

1. Sign up at <https://ollama.com> and generate an API key.
2. Either add it to `~/.pi/agent/auth.json`:
   ```json
   {
     "ollama-cloud": { "type": "api_key", "key": "your-key" }
   }
   ```
   ...or `export OLLAMA_API_KEY="your-key"` in your shell.
3. Inside Pi, run `/ollama-cloud-refresh` to pull the model list.

### The rest of the kit

| Extension | Install | Why |
|---|---|---|
| Sub-agents | `pi install npm:pi-subagents` | Delegates to parallel agents for complex work. |
| Context Mode | `pi install npm:pi-context-mode` | Compresses older turns to save context window. |
| MCP Adapter | `pi install npm:pi-mcp-adapter` | Connects Pi to existing MCP servers. |
| Web Access | `pi install npm:pi-web-access` | Web search, URL fetch, GitHub cloning. |
| GSD | `pi install npm:pi-gsd` | Planning and "Get Shit Done" execution. |

## Smoke test

```bash
# Local model present and on the external drive
ollama list
ls -la /Volumes/YOUR_DRIVE/ollama/models/blobs | head

# Local model responds quickly
ollama run qwen2.5-coder:3b "write a Python fizzbuzz"

# Cloud models reachable
pi --list-models gemma   # should include ollama-cloud/gemma4:31b

# Pi sees all providers
pi
# inside Pi:
#   /model        → Anthropic + Ollama (local) + Ollama Cloud
#   pi list       → installed extensions (run this in shell, not inside Pi)
#   ask Gemma a question (default), Ctrl-P to Qwen, Ctrl-P to Claude
#   trigger a web search to confirm pi-ollama-cloud's tools are wired
```

If Anthropic models are missing, re-run `/login`. If local Ollama is missing, check `curl http://localhost:11434/v1/models`. If cloud models are missing, check `OLLAMA_API_KEY` and re-run `/ollama-cloud-refresh`.

## Things to watch on a small Mac mini

- **Don't keep two local models warm at once.** Qwen 3B is the ceiling on 8GB unless you've stopped OrbStack and closed Chrome.
- **External drive unmount.** Anytime the drive ejects, Ollama can't load models and Pi falls back to Claude or cloud. Acceptable, just be aware.
- **Claude OAuth quotas.** Pro/Max has rate limits. If you hit them mid-task, `Ctrl-P` over to Gemma 4 31B or Qwen.
- **Ollama Cloud free tier has request caps.** If `gemma4:31b` starts returning rate-limit errors, either upgrade or fall back to local Qwen.
- **Extension churn.** Pi's extension ecosystem moves fast. Run `pi update` periodically; once you have a working set you like, pin specific versions in `~/.pi/agent/settings.json`'s `packages` array.

## Clean uninstall

Everything Pi creates lives under `~/.pi`, `~/.ollama`, and `/Volumes/YOUR_DRIVE/ollama`. No system files, no launchd plists, no kernel extensions. Removing those returns the machine to its prior state.

```bash
# Pi (binary, config, OAuth token)
rm -rf ~/.pi
# Then remove the PATH line the installer added in ~/.zshrc

# Ollama models on the external drive (or keep them — they're portable)
rm -rf /Volumes/YOUR_DRIVE/ollama

# The symlink (removes only the link, not the target)
rm ~/.ollama/models

# Optional: Ollama itself
brew uninstall ollama
rm -rf ~/.ollama
```
