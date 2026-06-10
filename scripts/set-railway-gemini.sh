#!/usr/bin/env bash
# Sync Gemini env vars from backend/.env to Railway backend service.
# Requires: npx @railway/cli and `railway login` first.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/backend/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

if [[ -z "${GEMINI_API_KEY:-}" ]]; then
  echo "GEMINI_API_KEY is empty in backend/.env"
  exit 1
fi

echo "Setting Gemini variables on Railway backend service..."
npx @railway/cli variables set \
  "GEMINI_API_KEY=$GEMINI_API_KEY" \
  "GEMINI_MODEL=${GEMINI_MODEL:-gemini-2.5-flash}" \
  "GEMINI_IMAGE_MODEL=${GEMINI_IMAGE_MODEL:-gemini-2.5-flash-image}" \
  ${GEMINI_PROJECT_ID:+"GEMINI_PROJECT_ID=$GEMINI_PROJECT_ID"}

echo "Done. Railway will redeploy the backend automatically."
