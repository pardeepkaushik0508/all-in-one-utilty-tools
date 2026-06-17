#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

PORT="${PORT:-5000}"
HOST="${HOST:-0.0.0.0}"

if [[ -n "${DATABASE_URL:-}" || -n "${MONGODB_URI:-}" ]]; then
  echo "Seeding database (idempotent)..."
  node db/seed.js || echo "Warning: seed step failed — continuing startup."
else
  echo "Warning: DATABASE_URL is not set — skipping seed."
fi

echo "Starting API server on ${HOST}:${PORT}"

exec node server.js
