# SpotSync Web

Live Operations Console for the [SpotSync API](https://github.com/rayeemomayeer/SpotSync) — real-time spot grid, SSE activity feed, and demo reservation flows.

![Live Operations Console](./public/live-console.png)

## Quick links

| | |
| --- | --- |
| **Live app** | https://spotsync-nu.vercel.app |
| **Live API** | https://spotsync-ei6g.onrender.com/api/v1 |
| **This repo** | https://github.com/rayeemomayeer/spotsync-web |
| **Backend repo** | https://github.com/rayeemomayeer/SpotSync |

---

## What this is

A **Next.js** dashboard that talks to the frozen SpotSync REST API. Pick a zone, watch stalls update over SSE, reserve with one click, and explore admin flows — built for portfolio demos and local dev against the Go backend.

### Features

- **Live Console** — zone rail, dynamic spot grid, activity feed + reserve panel
- **Real-time** — per-zone SSE (`/zones/:id/events`) + global zone availability stream (`/zones/stream`)
- **Optimistic reserve** — instant grid feedback, rollback on 409
- **Demo mode** — one-click driver/admin login, auto-expiring demo bookings
- **Mobile** — tab layout, keyboard grid navigation, skeleton loading
- **Tests** — Vitest unit tests + Playwright smoke in CI

---

## Try it now (no setup)

1. Open https://spotsync-nu.vercel.app
2. Click **Demo Driver**
3. Select a green stall → **Demo reserve**

Demo credentials (also work against production API):

| Role | Email | Password |
| --- | --- | --- |
| Driver | `alice@spotsync.com` | `DriverPass123!` |
| Demo admin | `demo_admin@spotsync.com` | `DemoAdminPass123!` |

---

## Local development

### 1. Backend

```bash
git clone https://github.com/rayeemomayeer/SpotSync.git
cd SpotSync
cp .env.example .env
docker compose -f deploy/compose/docker-compose.yml up -d postgres redis
make migrate-up
go run ./cmd/seed
make run    # listens on :8081 by default
```

### 2. Frontend

```bash
git clone https://github.com/rayeemomayeer/spotsync-web.git
cd spotsync-web
npm install
cp .env.example .env.local
npm run dev   # http://localhost:3000
```

---

## Environment

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | API base URL (local: `http://localhost:8081/api/v1`, prod: `https://spotsync-ei6g.onrender.com/api/v1`) |
| `NEXT_PUBLIC_DEMO_MODE` | `true` — demo headers + ghost grid eligibility |
| `NEXT_PUBLIC_DEMO_GHOST_GRID` | `true` — client-only simulated occupancy |
| `NEXT_PUBLIC_DEMO_ADMIN_EMAIL` | Demo admin email for one-click login |
| `NEXT_PUBLIC_DEMO_ADMIN_PASSWORD` | Demo admin password |

**Vercel:** set `NEXT_PUBLIC_API_BASE_URL=https://spotsync-ei6g.onrender.com/api/v1` and `NEXT_PUBLIC_DEMO_MODE=true`.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript |
| `npm run test:unit` | Vitest |
| `npm run test:e2e` | Playwright (set `SPOTSYNC_E2E_API=1` for full API flow) |

---

## Architecture (frontend)

```
LiveConsole
├── useZones + useZonesStream   → zone rail + live availability badges
├── useZoneSpots                → spot grid (optimistic cache)
├── useZoneEvents               → per-zone SSE → activity feed
└── ReservePanel / AdminSlideOver → graded API client
```

Design spec: `docs/design.md`

---

## Related

- **API docs & deploy:** [SpotSync README](https://github.com/rayeemomayeer/SpotSync#readme)
- **Health:** `curl https://spotsync-ei6g.onrender.com/healthz`
