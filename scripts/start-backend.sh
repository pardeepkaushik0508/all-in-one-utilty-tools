#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

PORT="${PORT:-5000}"
HOST="${HOST:-0.0.0.0}"

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "Running database migrations..."
  npx prisma generate
  npx prisma migrate deploy
  echo "Seeding database (idempotent)..."
  node prisma/seed.js || echo "Warning: seed step failed — continuing startup."
else
  echo "Warning: DATABASE_URL is not set — skipping migrations and seed."
fi

echo "Starting API server on ${HOST}:${PORT}"

exec node server.js
