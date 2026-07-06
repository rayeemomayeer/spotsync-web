import type { Spot } from "@/lib/api/types";
import { BLOCK_NAMES, SHOWCASE_SPOT_COUNT } from "./constants";

export function spotIndexFromLabel(label: string): number {
  const match = label.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

export type SpotBlock = {
  id: string;
  name: string;
  spots: Spot[];
};

const GRID_COLS = 6;

function isShowcaseLayout(spots: Spot[]): boolean {
  if (spots.length !== SHOWCASE_SPOT_COUNT) return false;
  const sorted = [...spots].sort((a, b) => spotIndexFromLabel(a.label) - spotIndexFromLabel(b.label));
  return sorted.every((s, i) => s.label.toUpperCase() === `A-${String(i + 1).padStart(2, "0")}`);
}

/** Showcase zones use 4 named rows; all others chunk into rows of 6. */
export function groupSpotsByBlock(spots: Spot[]): SpotBlock[] {
  const sorted = [...spots].sort((a, b) => spotIndexFromLabel(a.label) - spotIndexFromLabel(b.label));

  if (sorted.length === 0) {
    return [{ id: "empty", name: "Spots", spots: [] }];
  }

  if (isShowcaseLayout(sorted)) {
    return BLOCK_NAMES.map((name, i) => ({
      id: `block-${i}`,
      name,
      spots: sorted.slice(i * GRID_COLS, i * GRID_COLS + GRID_COLS),
    }));
  }

  const blocks: SpotBlock[] = [];
  for (let i = 0; i < sorted.length; i += GRID_COLS) {
    const row = Math.floor(i / GRID_COLS) + 1;
    const rowSpots = sorted.slice(i, i + GRID_COLS);
    blocks.push({
      id: `row-${row}`,
      name: sorted.length <= GRID_COLS ? "All spots" : `Row ${row}`,
      spots: rowSpots,
    });
  }
  return blocks;
}

export function pickShowcaseZone<T extends { id: number; name: string; type: string }>(
  zones: T[],
  fallback: T,
): T {
  const exact = zones.find((z) => z.name === "Terminal 1 EV Charging Suite");
  if (exact) return exact;
  const legacy = zones.find((z) => z.name === "Terminal 1 · EV Lot A");
  if (legacy) return legacy;
  const terminalEv = zones.find(
    (z) => z.name.includes("Terminal") && (z.type === "ev_charging" || z.name.toLowerCase().includes("ev")),
  );
  if (terminalEv) return terminalEv;
  const evLot = zones.find((z) => z.name.includes("EV Lot") || z.name.includes("EV Charging"));
  if (evLot) return evLot;
  return zones.find((z) => z.type === "ev_charging") ?? zones[0] ?? fallback;
}

export function nextAvailableSpot(spots: Spot[], excludeId?: number): Spot | null {
  return (
    spots.find(
      (s) => s.id !== excludeId && s.status === "available" && !s.occupied,
    ) ?? null
  );
}
