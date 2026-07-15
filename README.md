# SpotSync Web

Marketplace parking product UI for SpotSync — drivers book across org zones, org admins operate inventory, platform admins run the network.

![Live Operations Console](./public/live-console.png)

## Quick links

| | |
| --- | --- |
| **Live app** | https://spotsync-nu.vercel.app |
| **BFF** | https://spotsync-bff.onrender.com |
| **Go API** | https://spotsync-ei6g.onrender.com |
| **This repo** | https://github.com/rayeemomayeer/spotsync-web |
| **Full stack guide** | [docs/STACK.md](./docs/STACK.md) |
| **Go API repo** | https://github.com/rayeemomayeer/SpotSync |
| **BFF** | https://github.com/rayeemomayeer/spotsync-bff |
| **Notify** | https://github.com/rayeemomayeer/spotsync-notify |

## Product surfaces

| Path | Audience |
| --- | --- |
| `/` | Marketing landing |
| `/search` | Marketplace browse |
| `/login` · `/signup` | Better Auth (driver / org tabs) |
| `/apply` | Garage self-apply |
| `/driver` · `/book/[zoneId]` | Map + Stripe/demo checkout |
| `/reservations` · `/account` | Driver bookings & profile |
| `/org/*` | Org admin (zones, billing, members, observe) |
| `/platform/*` | SaaS admin hub |
| `/console` | Live ops console (legacy JWT / demo) |
| `/developers` | OpenAPI (ReDoc) + endpoint map |

Dark / light theme (system + toggle). Optional Sentry via `NEXT_PUBLIC_SENTRY_DSN` (`@sentry/nextjs`).

**Design system:** [docs/design-system.md](./docs/design-system.md). Console grid: [docs/design.md](./docs/design.md).

## Local development

See **[docs/STACK.md](./docs/STACK.md)** for all four services. Short path:

```bash
npm install
cp .env.example .env.local
npm run dev
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Prefer BFF `…/api/v1` (proxied Go) |
| `NEXT_PUBLIC_BFF_URL` | Better Auth + checkout origin |
| `NEXT_PUBLIC_FEATURE_FLAGS` | `stripe_billing,driver_payments,demo_mode,google_oauth` |
| `NEXT_PUBLIC_DEMO_MODE` | Portfolio demo chrome |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional client observability |

## Tests

```bash
npm run test:unit
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

## Deploy

Vercel — `vercel.json` security headers. GitHub Actions `keep-warm.yml` pings Render `/healthz` on a schedule (free-tier anti-sleep).

## License

MIT
