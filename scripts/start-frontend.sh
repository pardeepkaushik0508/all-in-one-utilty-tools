#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/frontend"

PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"

echo "Starting Next.js on ${HOST}:${PORT}"

# exec replaces npm/shell so Railway signals go directly to Next.js (avoids SIGTERM restart loops)
exec node "$ROOT/node_modules/next/dist/bin/next" start -H "$HOST" -p "$PORT"
