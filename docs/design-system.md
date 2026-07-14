# SpotSync Design System — Warm Minimal

Inspired by **Stripe** (typography, checkout precision) and **Airbnb** (warm surfaces, pill search, card browsing). Not a copy of either brand.

**Console / spot grid specifics:** see [design.md](./design.md).

---

## Brand voice

- Short, confident, specific — no generic SaaS filler
- Lead with live capacity (“18 spots left”) not feature lists
- Trust through clarity: prices, plates, receipts visible

**Wordmark:** SpotSync — UI font weight 700, letter-spacing -0.02em; accent dot optional on live indicators only

---

## Color

| Token | Light | Usage |
|-------|-------|--------|
| `--color-bg` | `#FAFAF8` | Page background (warm white) |
| `--color-surface` | `#FFFFFF` | Cards, inputs |
| `--color-ink` | `#222222` | Primary text |
| `--color-muted` | `#717171` | Secondary text |
| `--color-brand` | `#E0565B` | CTAs, live pulse, selected ring |
| `--color-brand-hover` | `#C94A4F` | Hover |
| `--color-brand-soft` | `rgba(224, 86, 91, 0.12)` | Tinted backgrounds |
| `--color-success` | `#008A05` | Available spots |
| `--color-border` | `#EBEBEB` | Dividers |
| `--color-danger` | `#C13515` | Errors, cancel |

Dark mode: warm `#1A1A1A` bg, `#262626` surface — not blue-gray.

Legacy aliases (`--ink`, `--accent`, `--bg`) map to these tokens in CSS.

---

## Typography

| Role | Font | Notes |
|------|------|--------|
| UI | Plus Jakarta Sans | Body, nav, buttons |
| Display | Fraunces | Marketing H1 only |
| Data | JetBrains Mono / tabular nums | Prices, IDs, plates |

Scale: 12 / 14 / 16 / 20 / 28 / 40 / 56 (px equivalent via rem)

---

## Spacing & radius

- Base unit: 4px
- Section vertical rhythm: 80–120px desktop, 48px mobile
- Radius: sm 8px, md 12px, lg 16px, pill 999px
- Shadow sm: `0 1px 2px rgba(0,0,0,0.06)`; md: `0 4px 24px rgba(0,0,0,0.08)`

---

## Components

### Button
- **Primary:** coral gradient fill, white text, soft brand shadow, hover lift + sheen
- **Secondary:** surface + border + light shadow
- **Ghost:** dashed border → solid brand on hover
- **Pill modifier:** `console-btn--pill` for CTAs in nav / hero

### Navbar
- Sticky frosted bar with fade hairline
- Live mark (asymmetric spot + pulse) beside wordmark
- Center floating pill island for links; active = filled chip

### Search pill (Airbnb)
- Unified bar: location + optional datetime + search icon button
- Shadow md, radius lg, min-height 56px desktop

### Card
- Asymmetric radius (softer bottom-left), top brand ink rule
- Offset “stamp” shadow on zone / how-it-works cards
- Zone media: lane-line pattern + dashed stall outline
- Optional `shell-card--elevate` for stronger stamp shadow

### Badge
- Available: success soft bg; Low: warn; Full: muted

### Bottom sheet
- Mobile zone preview / driver detail — 20px top radius, handle bar

### Checkout stepper (Stripe)
- Horizontal steps, monospace totals, clear active state

---

## Motion

- Card hover: translateY(-3px) + slight rotate on marketing steps, 180ms
- Primary button: lift + sheen sweep
- Nav mark: soft pulse (live capacity cue)
- Sheet: slide up, Framer AnimatePresence
- Spot grid: existing Framer layoutId + shake on 409

---

## Spot grid (console)

See [design.md](./design.md) for cell states and ops layout. Grid uses `--color-success`, `--color-busy`, `--color-brand` for selection ring.
