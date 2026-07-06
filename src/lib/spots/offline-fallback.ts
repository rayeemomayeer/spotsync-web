import type { Spot, Zone } from "@/lib/api/types";
import { SHOWCASE_ZONE_NAME } from "./constants";

export const OFFLINE_SHOWCASE_ZONE: Zone = {
  id: 0,
  name: SHOWCASE_ZONE_NAME,
  type: "ev_charging",
  total_capacity: 24,
  price_per_hour: 6,
  available_spots: 14,
  created_at: "",
  updated_at: "",
};

export function offlineShowcaseSpots(): Spot[] {
  return Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    zone_id: 0,
    label: `A-${String(i + 1).padStart(2, "0")}`,
    pos_x: 0,
    pos_y: 0,
    status: "available" as const,
    occupied: i >= 14,
    created_at: "",
    updated_at: "",
  }));
}
