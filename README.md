# SpotSync Web

Map-first Next.js frontend for [SpotSync](../SpotSync) — illustrated parking lot, demo showcase layer, and spot-level reservations.

## Features

- Full-viewport illustrated parking map (SVG + d3-zoom)
- Click-to-reserve with `spot_id` + demo auto-expiry (`X-Demo-Reservation`)
- One-click **Demo Driver** login (`alice@spotsync.com` / `DriverPass123!`)
- Client-side ghost traffic (GSAP drive-in animation, no API writes)
- Minimal premium motion (Framer Motion for UI; GSAP for car paths only)

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ensure the SpotSync API is running with migrations through `000002` and seed data:

```bash
cd ../SpotSync
make migrate-up
go run ./cmd/seed
make run
```

## Environment

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | API base (default `http://localhost:8080/api/v1`) |
| `NEXT_PUBLIC_DEMO_MODE` | Enable live ghost traffic + demo booking headers |
| `NEXT_PUBLIC_DEMO_ADMIN_EMAIL` | Admin email for one-click demo (from seed env) |
| `NEXT_PUBLIC_DEMO_ADMIN_PASSWORD` | Admin password for demo login |

## Demo credentials

- **Driver:** `alice@spotsync.com` / `DriverPass123!`
- **Admin:** values from backend `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`

Demo reservations auto-expire after 10 minutes (backend `demo_expires_at` lazy cleanup).

## Design reference

See `docs/design.md` and backend `assets/spotsync-demo-preview-desktop-map.png`.
