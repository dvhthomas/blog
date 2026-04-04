#!/bin/bash
set -e

# Set up PATH so launchd services find homebrew, ASDF, etc.
eval "$(/opt/homebrew/bin/brew shellenv)"
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"
export PATH="$HOME/.asdf/shims:$PATH"

cd /Users/bitsbyme/projects/code-orchestrator

# Build the client (tsc + vite)
npm run build -w client

# Start the API server (port 5400)
exec /opt/homebrew/bin/npx tsx server/src/index.ts
