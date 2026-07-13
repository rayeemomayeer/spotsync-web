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

Render free sleeps. First hit after idle can take 30–90s. Web calls BFF **directly** (`NEXT_PUBLIC_API_BASE_URL`) so Vercel rewrites do not time out.

## Auth / demo

- Signup: `/signup` → Better Auth on BFF → Go user bridge (`driver` only).
- Seeded: `admin@spotsync.com` (saas_admin), `demo_admin@spotsync.com` (org_admin), `alice@spotsync.com` (driver).
- Prod/preview: `NEXT_PUBLIC_DEMO_MODE=true` + `NEXT_PUBLIC_DEMO_GHOST_GRID=true` so Demo Driver/Admin show on console.

## Outbox → email

1. Go API has `EMBED_WORKER=true` (relay + expiry inside API process).
2. `REDIS_URL` must match on **Go** and **notify**.
3. Notify needs `RESEND_API_KEY` + `EMAIL_FROM`.
4. Reserve → outbox → Redis `spotsync:notify` JSON → Resend.

## Stripe (test)

- BFF: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`.
- Web: `NEXT_PUBLIC_FEATURE_FLAGS=stripe_billing`.
- Checkout: `POST /api/stripe/checkout` (saas_admin session) → Stripe Checkout.
- Webhook: `POST /api/stripe/webhook` (logs event; plan persistence deferred).

## Observability

- Web: `@sentry/nextjs` — set `NEXT_PUBLIC_SENTRY_DSN` (+ optional `SENTRY_DSN`) on Vercel.
- BFF: `@sentry/node` — set `SENTRY_DSN` on Render.
- Go: OTLP when `OTEL_EXPORTER_OTLP_ENDPOINT` set (optional).

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
| Login does nothing | Cookie SameSite / wrong `BETTER_AUTH_URL` / `FRONTEND_ORIGIN` |
| Spots “unreachable” | BFF/Go cold start; wait and retry |
| No reserve email | Redis mismatch, missing Resend key, or outbox relay down (`EMBED_WORKER`) |
| Checkout 503 | Missing Stripe price env on BFF |
| Org list 401/403 | Need saas_admin session + goUserId linked (sign out/in once) |
