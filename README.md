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
| **BFF** | sibling `spotsync-bff` (Better Auth) |
| **Notify** | sibling `spotsync-notify` (Resend) |

## Product surfaces

| Path | Audience |
| --- | --- |
| `/` | Marketing landing |
| `/login` | Better Auth via BFF |
| `/driver` | Driver book flow (LiveConsole) |
| `/org` | Org admin shell |
| `/platform` | SaaS admin shell |
| `/platform/billing` | Stripe **test mode** plans |
| `/console` | Live ops console (demo JWT path) |
| `/developers` | Lightweight developer portal |

Dark / light theme supported (system preference + toggle).

## Local development

1. Start Go API (+ Redis recommended) from SpotSync-server.
2. Start `spotsync-bff` on `:4000`.
3. `npm install && cp .env.example .env.local && npm run dev`

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Go API `/api/v1` |
| `NEXT_PUBLIC_BFF_URL` | Express BFF origin |
| `NEXT_PUBLIC_DEMO_MODE` | Demo reserve headers |
| `NEXT_PUBLIC_FEATURE_FLAGS` | e.g. `stripe_billing` |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional client observability |

## Tests

```bash
npm run test:unit
npm run test:e2e
```

## License

MIT
