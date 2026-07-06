# SpotSync UI — Locked Design + Showcase Spec

Reference mockup: `public/reference-desktop-map.png` (desktop illustrated map dashboard).

## Visual identity

- Illustrated top-down parking map (~90% viewport)
- Soft pastel palette: sky blue `#7EC8E3`, tan asphalt `#D4C4A8`, terracotta `#C45C4A`, road `#5E5E5C`
- Peripheral overlays only — never cover empty stalls

## Layout (matches mockup)

| Position | Element |
| --- | --- |
| Top-left | Zone pill — green dot, zone name, “N spots free” in sky blue |
| Top-right | Search pill — “Search zone…” |
| Bottom-left | Legend — Available (green) · Occupied (grey) |
| Bottom-right | Reserve card — spot label, license plate, Reserve button |
| Bottom-center | Dock — home, elevated location-pin FAB, notification bell |

## Animation catalog

| Moment | Tool |
| --- | --- |
| Spot select pulse | Framer Motion |
| Overlay enter/exit | Framer Motion spring |
| 409 spot taken | Framer shake + toast |
| Occupancy counter | Framer AnimatePresence |
| Last spot stress | Pulsing zone pill + stall highlight |
| Ghost car drive-in | GSAP timeline on SVG path |
| Dock FAB hover | Framer scale 1.05 |

## Demo strategy (hybrid)

- **Ghost cars:** client-only `SimulationEngine`, max 3, 8–15s interval
- **Demo booking:** real API + `X-Demo-Reservation: true` + `DEMO-*` plate
- **DB safety:** ghosts never call API; demo reservations TTL 10m on backend
