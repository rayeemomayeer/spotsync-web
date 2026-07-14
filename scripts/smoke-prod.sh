#!/usr/bin/env bash
# Cross-repo prod smoke (P0). Run after Vercel/Render deploys.
set -euo pipefail

BFF_URL="${BFF_URL:-https://spotsync-bff.onrender.com}"
GO_URL="${GO_URL:-https://spotsync-ei6g.onrender.com}"
WEB_URL="${WEB_URL:-https://spotsync-nu.vercel.app}"
NOTIFY_URL="${NOTIFY_URL:-https://spotsync-notify.onrender.com}"

ok() { echo "OK  $1"; }
fail() { echo "FAIL $1"; exit 1; }

check_http() {
  local name="$1" url="$2" expect="${3:-200}"
  local code
  code=$(curl -sS -o /tmp/spotsync-smoke-body.txt -w "%{http_code}" --max-time 90 "$url" || true)
  if [[ "$code" == "$expect" ]]; then
    ok "$name ($code)"
  else
    echo "---- body ----"
    head -c 400 /tmp/spotsync-smoke-body.txt || true
    echo
    fail "$name (got $code want $expect) $url"
  fi
}

echo "== SpotSync prod smoke =="
echo "BFF=$BFF_URL"
echo "GO=$GO_URL"
echo "WEB=$WEB_URL"

check_http "BFF /healthz" "$BFF_URL/healthz"
check_http "BFF /readyz" "$BFF_URL/readyz"
check_http "Go /healthz" "$GO_URL/healthz"
check_http "Go /readyz" "$GO_URL/readyz"
check_http "Go /api/v1/zones" "$GO_URL/api/v1/zones"
check_http "Web /" "$WEB_URL/"
check_http "Web /search" "$WEB_URL/search"
check_http "Web /login" "$WEB_URL/login"
check_http "Web /pricing" "$WEB_URL/pricing"

# Quote is public-ish via BFF (no auth required for amount calc).
QUOTE_CODE=$(curl -sS -o /tmp/spotsync-quote.json -w "%{http_code}" --max-time 90 \
  -H "Content-Type: application/json" \
  -d '{"zone_id":1,"duration_hours":1,"license_plate":"SMOKE-1"}' \
  "$BFF_URL/api/checkout/quote" || true)
if [[ "$QUOTE_CODE" == "200" ]]; then
  ok "BFF checkout quote ($QUOTE_CODE)"
else
  echo "WARN BFF checkout quote returned $QUOTE_CODE (cold start or config) — non-fatal"
fi

# Notify may cold-start; warn only.
NOTIFY_CODE=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 60 "$NOTIFY_URL/healthz" || true)
if [[ "$NOTIFY_CODE" == "200" ]]; then
  ok "Notify /healthz ($NOTIFY_CODE)"
else
  echo "WARN Notify /healthz $NOTIFY_CODE — non-fatal on free tier"
fi

echo "OK: prod smoke finished"
