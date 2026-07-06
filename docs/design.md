# SpotSync UI — Locked Design + Showcase Spec

## Visual identity

- Illustrated top-down parking map (~90% viewport)
- Soft pastel palette: sky blue `#7EC8E3`, tan asphalt `#D4C4A8`, terracotta `#C45C4A`
- Peripheral overlays only — never cover empty stalls

## Animation catalog (minimal premium)

| Moment | Tool |
| --- | --- |
| Spot select pulse | Framer Motion |
| Overlay enter/exit | Framer Motion spring |
| 409 spot taken | Framer shake + toast |
| Occupancy counter | Framer AnimatePresence |
| Ghost car drive-in | GSAP timeline on SVG path |
| Dock hover | Framer scale 1.05 |

## Demo strategy (hybrid)

- **Ghost cars:** `SimulationEngine` — client-only, max 3, 8–15s interval
- **Demo booking:** real API + `X-Demo-Reservation: true` + `DEMO-*` plate
- **DB safety:** ghosts never call API; demo reservations TTL 10m on backend

Reference mockup: SpotSync backend repo `assets/spotsync-demo-preview-desktop-map.png`
