import type { Zone } from "@/lib/api/types";

/** Deterministic pseudo-map coordinates (0–100) from zone id — no lat/lng in API yet. */
export function zoneMapPosition(zone: Zone): { x: number; y: number } {
  const seed = zone.id * 2654435761;
  const x = 12 + ((seed >>> 0) % 76);
  const y = 18 + (((seed >>> 8) >>> 0) % 58);
  return { x, y };
}

export function zonePinLabel(zone: Zone): string {
  const free = zone.available_spots;
  if (free <= 0) return "Full";
  if (free <= 3) return `${free} left`;
  return `$${zone.price_per_hour.toFixed(0)}/hr`;
}
