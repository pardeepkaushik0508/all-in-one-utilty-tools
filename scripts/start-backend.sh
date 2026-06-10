#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

PORT="${PORT:-5000}"
HOST="${HOST:-0.0.0.0}"

echo "Starting API server on ${HOST}:${PORT}"

exec node server.js
