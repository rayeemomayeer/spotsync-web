# SpotSync ops runbook

Production stack (free tier):

| Piece | Where | URL |
|-------|--------|-----|
| Web | Vercel | https://spotsync-nu.vercel.app |
| BFF | Render | https://spotsync-bff.onrender.com |
| Go API | Render | https://spotsync-ei6g.onrender.com |
| Notify | Render | https://spotsync-notify.onrender.com |
| DB | Neon | shared by Go + Better Auth |
| Redis | Render Key Value `spotsync-redis` | internal `redis://red-…:6379` |

## Cold starts

Render free sleeps. First hit after idle can take 30–90s.

- **Web → BFF auth:** browser calls `NEXT_PUBLIC_BFF_URL` **directly** (Better Auth cookies are `SameSite=None`). Do **not** rely on Vercel `/api/auth` rewrites for login — those return **504 Gateway Timeout** while Render wakes.
- **API data:** `NEXT_PUBLIC_API_BASE_URL` hits BFF/Go direct the same way.
- Login/signup pages warm `/healthz` on mount and before submit; fetch layer retries 502/503/504 with backoff.

## Auth / demo

- Signup: `/signup` → Better Auth on BFF → Go user bridge (`driver` only).
- Seeded: `admin@spotsync.com` (saas_admin), `demo_admin@spotsync.com` (org_admin), `alice@spotsync.com` (driver).
- Prod/preview: `NEXT_PUBLIC_DEMO_MODE=true` + `NEXT_PUBLIC_DEMO_GHOST_GRID=true` so Demo Driver/Admin show on console.

## Worker topology

- **Production:** dedicated `spotsync-worker` on Render (`EMBED_WORKER=false` on API).
- **Local single-process:** set `EMBED_WORKER=true` on Go API only.

## Outbox → email

1. Worker (or `EMBED_WORKER=true` locally) relays outbox → Redis `spotsync:notify`.
2. `REDIS_URL` must be the **same** on Go API, worker, and notify (Render internal URL in same region).
3. Notify needs `RESEND_API_KEY` + verified `EMAIL_FROM`.
4. Reserve as signed-in user with email on Go user row → confirm inbox + notify logs.

**Verify email E2E:**

```bash
# After reserve on prod (alice or your account)
curl -sS "https://spotsync-notify.onrender.com/healthz"
# Check Render logs: spotsync-notify → "[notify] event" + Resend response
```

## Stripe (test)

- BFF: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, `GO_PLATFORM_USER_ID=1`.
- Webhook `checkout.session.completed` → Go `PATCH /api/v1/orgs/:id/plan`.

## Observability

- Web: `@sentry/nextjs` — set `NEXT_PUBLIC_SENTRY_DSN` (+ optional `SENTRY_DSN`) on Vercel.
- BFF: `@sentry/node` — set `SENTRY_DSN` on Render.
- Go: OTLP when `OTEL_EXPORTER_OTLP_ENDPOINT` set (Grafana Cloud / Jaeger).
- Grafana dashboard as code: `SpotSync-server/deploy/grafana/dashboards/spotsync-api.json`.
- Scrape `https://spotsync-ei6g.onrender.com/metrics` with `METRICS_TOKEN`.

## Smoke checks

```bash
curl -sS https://spotsync-ei6g.onrender.com/healthz
curl -sS https://spotsync-bff.onrender.com/healthz
curl -sS https://spotsync-notify.onrender.com/healthz

# Local Playwright against prod
PLAYWRIGHT_BASE_URL=https://spotsync-nu.vercel.app npm run test:e2e:prod
```

## Incident tips

| Symptom | Likely cause |
|---------|----------------|
| Login gateway timeout / feels broken | Hit same-origin rewrite while BFF asleep — use direct BFF URL + warm; retry |
| Login does nothing | Cookie SameSite / wrong `BETTER_AUTH_URL` / `FRONTEND_ORIGIN` |
| Spots “unreachable” | BFF/Go cold start; wait and retry |
| No reserve email | Redis mismatch, missing Resend key, or outbox relay down (`EMBED_WORKER`) |
| Checkout 503 | Missing Stripe price env on BFF |
| Org list 401/403 | Need saas_admin session + goUserId linked (sign out/in once) |
