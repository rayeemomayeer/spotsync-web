# SpotSync Web

Marketplace parking product UI for SpotSync — drivers book across org zones, org admins operate inventory, platform admins run the network.

![Live Operations Console](./public/live-console.png)

## Quick links

| | |
| --- | --- |
| **Live app** | https://spotsync-nu.vercel.app |
| **Live API** | https://spotsync-ei6g.onrender.com/api/v1 |
| **This repo** | https://github.com/rayeemomayeer/spotsync-web |
| **Go API** | https://github.com/rayeemomayeer/SpotSync |
| **BFF** | sibling `spotsync-bff` (Better Auth + Stripe test + notify forward) |
| **Notify** | sibling `spotsync-notify` (Resend + Redis) |

## Product surfaces

| Path | Audience |
| --- | --- |
| `/` | Marketing landing |
| `/login` | Better Auth via BFF |
| `/driver` | Driver book flow (LiveConsole) |
| `/org` | Org admin shell |
| `/platform` | SaaS admin shell |
| `/platform/billing` | Stripe **test mode** plans (flag `stripe_billing`) |
| `/console` | Live ops console (demo JWT path) |
| `/developers` | Lightweight developer portal |

Dark / light theme supported (system preference + toggle). Optional client observability via `NEXT_PUBLIC_SENTRY_DSN` (stub until full Sentry SDK wired).

**Design system:** [docs/design-system.md](./docs/design-system.md) — warm minimal tokens (Stripe + Airbnb inspired). Console grid spec in [docs/design.md](./docs/design.md).

## Local development

1. Start Go API (+ Redis recommended) from SpotSync-server compose.
2. Start `spotsync-bff` on `:4000` (optional `NOTIFY_URL` → notify `:3100`).
3. Optional: start `spotsync-notify` on `:3100`.
4. `npm install && cp .env.example .env.local && npm run dev`

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Go API `/api/v1` |
| `NEXT_PUBLIC_BFF_URL` | Express BFF origin |
| `NEXT_PUBLIC_DEMO_MODE` | Demo reserve headers |
| `NEXT_PUBLIC_FEATURE_FLAGS` | e.g. `stripe_billing` |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional client observability stub |

## Tests

```bash
npm run test:unit
npm run lint
npm run build
npm run test:e2e
```

## Deploy

Vercel — `vercel.json` sets security headers (CSP, frame deny, nosniff, referrer, permissions).

## License

MIT
