#!/usr/bin/env bash
set -euo pipefail

BFF_URL="${BFF_URL:-https://spotsync-bff.onrender.com}"
GO_URL="${GO_URL:-https://spotsync-ei6g.onrender.com}"
WEB_URL="${WEB_URL:-https://spotsync-nu.vercel.app}"

echo "==> BFF healthz"
curl -fsS "$BFF_URL/healthz" | head -c 200
echo

echo "==> BFF readyz"
curl -fsS "$BFF_URL/readyz" | head -c 200
echo

echo "==> Go healthz"
curl -fsS "$GO_URL/healthz" | head -c 200
echo

echo "==> Go zones (public)"
curl -fsS "$GO_URL/api/v1/zones" | head -c 400
echo

echo "==> Web landing"
curl -fsS -o /dev/null -w "HTTP %{http_code}\n" "$WEB_URL/"

echo "OK: cross-repo smoke passed"
