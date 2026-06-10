#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVICE="${RAILWAY_SERVICE_NAME:-}"
DOMAIN="${RAILWAY_PUBLIC_DOMAIN:-}"
APP_ROLE="${APP_ROLE:-}"

echo "Railway deploy — service: ${SERVICE:-unknown}, domain: ${DOMAIN:-unknown}, APP_ROLE: ${APP_ROLE:-unset}"

is_backend() {
  [[ "$APP_ROLE" == "backend" ]] && return 0
  [[ "$SERVICE" == *"backend"* ]] && return 0
  [[ "$DOMAIN" == *"backend"* ]] && return 0
  return 1
}

is_frontend() {
  [[ "$APP_ROLE" == "frontend" ]] && return 0
  [[ "$SERVICE" == *"frontend"* ]] && return 0
  [[ "$DOMAIN" == *"frontend"* ]] && return 0
  return 1
}

if is_backend; then
  echo "Starting Express API (backend)..."
  exec bash "$ROOT/scripts/start-backend.sh"
fi

if is_frontend; then
  echo "Starting Next.js (frontend)..."
  exec bash "$ROOT/scripts/start-frontend.sh"
fi

echo ""
echo "ERROR: Cannot detect whether this is the frontend or backend Railway service."
echo "Set APP_ROLE=backend on the backend service, or APP_ROLE=frontend on the frontend service."
echo "Also ensure the backend service uses railway.backend.toml as its config file."
exit 1
