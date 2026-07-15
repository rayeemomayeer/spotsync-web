# SpotSync — run the full stack

Four sibling repos make up the live product. Free-tier Render may sleep (~15m) — open login and wait for “API ready”, or rely on GitHub `keep-warm` cron / SoftWarm pings.

| Service | Repo | Live | Local default |
|---------|------|------|---------------|
| Go API | [SpotSync](https://github.com/rayeemomayeer/SpotSync) | https://spotsync-ei6g.onrender.com | `:8081` |
| BFF | [spotsync-bff](https://github.com/rayeemomayeer/spotsync-bff) | https://spotsync-bff.onrender.com | `:4000` |
| Notify | [spotsync-notify](https://github.com/rayeemomayeer/spotsync-notify) | Render | `:3100` |
| Web | [spotsync-web](https://github.com/rayeemomayeer/spotsync-web) | https://spotsync-nu.vercel.app | `:3000` |

## Architecture

```text
Browser (Vercel)
   │  Better Auth cookies + Go JWT bridge
   ├─► BFF (/api/auth, /api/checkout, /api/stripe, /api/v1 proxy)
   │      ├─► Go reservation engine (Postgres + Redis)
   │      └─► Notify (Resend) for receipts / auth mail
   └─► Stripe Checkout (test mode only)
```

## Local boot (order)

1. **Go** — from SpotSync-server: docker compose Postgres/Redis, migrate, `go run ./cmd/api` (and worker if separate).
2. **Notify** (optional) — `spotsync-notify`: set `REDIS_URL`, `RESEND_API_KEY`, `INTERNAL_TOKEN`.
3. **BFF** — `spotsync-bff`: copy `.env.example` → `.env`. Align `JWT_SECRET` with Go, `GO_API_BASE_URL`, `DATABASE_URL` (Better Auth), `FRONTEND_ORIGIN=http://localhost:3000`, optional `NOTIFY_URL` + `NOTIFY_INTERNAL_TOKEN`.
4. **Web** — `spotsync-web`: `.env.local` with:
   - `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1` (prefer BFF proxy)
   - `NEXT_PUBLIC_BFF_URL=http://localhost:4000`
   - `NEXT_PUBLIC_FEATURE_FLAGS=stripe_billing,driver_payments,demo_mode,google_oauth`
   - `NEXT_PUBLIC_DEMO_MODE=true` for portfolio sandbox chrome

```bash
# terminals
cd SpotSync-server && make run          # or go run
cd spotsync-notify && npm run dev
cd spotsync-bff && npm run dev
cd spotsync-web && npm run dev
```

## Demo script (portfolio)

1. Open https://spotsync-nu.vercel.app — wait for StackPulse / wake banner if free tier sleeping.
2. **Driver:** sign in (email or Google) → `/driver` → pick zone → `/book` → Stripe test `4242…` **or** Skip demo booking.
3. **Garage:** `/login?as=org` → `/apply` → platform admin approves on `/platform/orgs` → `/org/billing` subscribe (test) → create zone.
4. **Platform:** saas_admin → `/platform` KPIs, users, observe.

## Free-tier notes

- Render free sleeps; web SoftWarm + Actions `keep-warm.yml` ping `/healthz` every ~12m.
- Google OAuth needs `GOOGLE_CLIENT_ID/SECRET` on BFF and `google_oauth` in web flags — redirect URI = `https://spotsync-bff.onrender.com/api/auth/callback/google`.
- Never put live Stripe keys; BFF rejects `sk_live_*`.

## Ship checklist

- [x] Auth (Better Auth + Go bridge JWT)
- [x] Org apply / approve / subscribe
- [x] Driver hosted Checkout + demo skip
- [x] Payment receipt / refund emails via notify (when NOTIFY_* set)
- [x] Keep-warm cron + Google warm-before-redirect
- [ ] Deep Playwright against live Stripe (manual smoke OK for portfolio)
