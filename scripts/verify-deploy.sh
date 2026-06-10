#!/usr/bin/env bash
set -euo pipefail

BACKEND_URL="${1:-https://aio-tools-backend-production.up.railway.app}"
FRONTEND_URL="${2:-https://aio-tools-frontend-production.up.railway.app}"

echo "Checking backend: $BACKEND_URL"
BACKEND_ROOT=$(curl -sf --max-time 15 "$BACKEND_URL/" || echo "FAIL")
BACKEND_HEALTH=$(curl -sf --max-time 15 "$BACKEND_URL/api/health" || echo "FAIL")

if echo "$BACKEND_HEALTH" | grep -q '"status":"ok"'; then
  echo "OK  Backend /api/health returns JSON"
elif echo "$BACKEND_ROOT" | grep -q 'aio-tools-backend'; then
  echo "OK  Backend root identifies as Express API"
elif echo "$BACKEND_HEALTH$BACKEND_ROOT" | grep -q 'Page Not Found\|UtilityTools\|__NEXT_DATA__'; then
  echo "FAIL Backend URL is serving the Next.js FRONTEND — wrong Railway start command."
  echo "     Fix: backend service must use railway.backend.toml and APP_ROLE=backend"
  exit 1
else
  echo "FAIL Backend not reachable or unhealthy"
  echo "     Response: ${BACKEND_HEALTH:0:200}"
  exit 1
fi

echo ""
echo "Checking frontend: $FRONTEND_URL"
FRONTEND_CODE=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 15 "$FRONTEND_URL/" || echo "000")
if [[ "$FRONTEND_CODE" == "200" ]]; then
  echo "OK  Frontend home page (HTTP 200)"
else
  echo "WARN Frontend returned HTTP $FRONTEND_CODE"
fi

echo ""
echo "Deploy verification passed."
