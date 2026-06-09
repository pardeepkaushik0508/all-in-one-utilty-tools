#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CLEAN_NEXT="${CLEAN_NEXT:-0}"
if [[ "$CLEAN_NEXT" == "1" ]]; then
  rm -rf frontend/.next
fi

fuser -k 3000/tcp 3001/tcp 5000/tcp 2>/dev/null || true

echo "Starting backend on port 5000..."
npm run dev --workspace backend &
BACKEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" 2>/dev/null || true
  fuser -k 5000/tcp 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Waiting for backend health check..."
ready=0
for _ in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:5000/api/health" >/dev/null 2>&1; then
    ready=1
    break
  fi
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo ""
    echo "Backend exited before it was ready."
    echo "Run separately to see errors: npm run dev:backend"
    exit 1
  fi
  sleep 0.5
done

if [[ "$ready" != "1" ]]; then
  echo ""
  echo "Backend did not respond on http://127.0.0.1:5000/api/health within 30s."
  echo "Run separately to debug: npm run dev:backend"
  exit 1
fi

echo "Backend ready. Starting frontend on port 3000..."
npm run dev --workspace frontend
