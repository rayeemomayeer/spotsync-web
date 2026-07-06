import type { Spot } from "@/lib/api/types";
import { offlineShowcaseSpots, OFFLINE_SHOWCASE_ZONE } from "./offline-fallback";

/** Offline/demo rows use zone_id 0 and empty timestamps — never send their ids to the API. */
export function isOfflineSpotData(spots: Spot[]): boolean {
  return spots.length > 0 && spots.every((s) => s.zone_id === OFFLINE_SHOWCASE_ZONE.id && s.created_at === "");
}

export function normalizeShowcaseSpots(apiSpots: Spot[] | undefined, zoneId: number): Spot[] {
  if (!apiSpots?.length) {
    return offlineShowcaseSpots().map((s) => ({ ...s, zone_id: zoneId }));
  }
  return apiSpots.map((s) => ({ ...s, zone_id: zoneId }));
}

export function patchSpotOccupied(spots: Spot[], spotId: number, occupied: boolean): Spot[] {
  return spots.map((s) => (s.id === spotId ? { ...s, occupied } : s));
}

export function patchSpotReleased(spots: Spot[], spotId: number): Spot[] {
  return spots.map((s) => (s.id === spotId ? { ...s, occupied: false } : s));
}
