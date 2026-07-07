import { describe, expect, it } from "vitest";
import { readZoneSpotsCache, writeZoneSpotsCache } from "./useZoneSpots";
import type { Spot } from "@/lib/api/types";

const spot = (id: number): Spot => ({
  id,
  zone_id: 1,
  label: `A-${id}`,
  pos_x: 0,
  pos_y: 0,
  status: "available",
  occupied: false,
  created_at: "t",
  updated_at: "t",
});

describe("readZoneSpotsCache", () => {
  it("unwraps ZoneSpotsResult", () => {
    const result = readZoneSpotsCache({ spots: [spot(1)], online: true }, []);
    expect(result.spots).toHaveLength(1);
  });

  it("accepts legacy Spot[] cache entries", () => {
    const result = readZoneSpotsCache([spot(2)], []);
    expect(result.spots[0].id).toBe(2);
  });
});

describe("writeZoneSpotsCache", () => {
  it("preserves online flag when updating spots", () => {
    const next = writeZoneSpotsCache([spot(3)], { spots: [spot(1)], online: false });
    expect(next.online).toBe(false);
    expect(next.spots[0].id).toBe(3);
  });
});
