# SpotSync UI — Live Operations Console (v2)

**Global tokens, marketing, auth, checkout:** see [design-system.md](./design-system.md).

**Design note:** Replaces the illustrated map-first design. The raster-map + polygon calibration approach was retired in favor of a label-driven spot grid.

## Visual identity

Console uses global tokens from [design-system.md](./design-system.md). Console-specific:

- **Layout:** Three-column desktop console on warm off-white (uses `--color-bg`)
- **Accent:** Brand coral for CTAs, selected stall, live SSE indicator
- **Available:** `--color-success`
- **Occupied:** `#5E5E5C`
- **Unavailable:** `#D4C4A8` at 50% opacity
- **Text:** `--color-ink` on `--color-surface` cards

## Layout

| Region | Element |
| --- | --- |
| Top bar | Logo, Demo Driver / Demo Admin, user chip, API + SSE status |
| Left rail | Zone list, search, type filter, availability badges |
| Center | Zone title, availability meter (`18 / 24 free`), 4×6 spot grid |
| Right column | Live activity feed (SSE), reserve panel, my reservations |

## Spot grid

- Stalls from API `label`, `status`, `occupied` — no raster map or `pos_x`/`pos_y` for interaction
- Four blocks of six: A-01…A-06, A-07…A-12, A-13…A-18, A-19…A-24
- Cell states: available, occupied, unavailable, selected, ghost (demo), stress pulse (last spot)

## Animation catalog

| Moment | Tool |
| --- | --- |
| Spot select ring | Framer Motion `layoutId` |
| Occupancy change | Framer scale + color transition |
| Activity feed entry | Framer slide-in |
| 409 spot taken | Shake on cell + error text |
| Last spot stress | Pulsing availability counter + grid border |
| Ghost demo occupancy | Client-only cell flash (`NEXT_PUBLIC_DEMO_GHOST_GRID`) |

## Demo strategy

- **Demo booking:** real API + `X-Demo-Reservation: true` + `DEMO-*` plate
- **Ghost grid:** client-only simulated occupancy on random cells when demo mode + ghost flag enabled
- **Demo admin:** POST reserve only; admin CRUD hidden for `demo_admin` role

## Explicitly retired

- Illustrated `map.png` interactive layer
- Stall polygon registry and `/dev/calibrate-map`
- GSAP road-path ghost cars
- d3-zoom pan/zoom map canvas
