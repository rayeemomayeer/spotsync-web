import { describe, expect, it } from "vitest";
import { groupSpotsByBlock, nextAvailableSpot, pickShowcaseZone, spotIndexFromLabel } from "./grouping";
import type { Spot } from "@/lib/api/types";

function spot(id: number, label: string, occupied = false): Spot {
  return {
    id,
    zone_id: 1,
    label,
    pos_x: 0,
    pos_y: 0,
    status: "available",
    occupied,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  };
}

describe("groupSpotsByBlock", () => {
  it("uses named rows for 24-spot A-01 showcase layout", () => {
    const spots = Array.from({ length: 24 }, (_, i) => spot(i + 1, `A-${String(i + 1).padStart(2, "0")}`));
    const blocks = groupSpotsByBlock(spots);
    expect(blocks).toHaveLength(4);
    expect(blocks[0].spots).toHaveLength(6);
    expect(blocks[0].name).toBe("Upper west row");
  });

  it("chunks non-showcase zones into rows of 6", () => {
    const spots = Array.from({ length: 12 }, (_, i) => spot(i + 1, `B-${i + 1}`));
    const blocks = groupSpotsByBlock(spots);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].spots).toHaveLength(6);
  });
});

describe("pickShowcaseZone", () => {
  const fallback = { id: 0, name: "fallback", type: "general" };

  it("prefers Terminal 1 EV Charging Suite", () => {
    const zones = [
      { id: 1, name: "Downtown", type: "general" },
      { id: 2, name: "Terminal 1 EV Charging Suite", type: "ev_charging" },
    ];
    expect(pickShowcaseZone(zones, fallback).id).toBe(2);
  });
});

describe("nextAvailableSpot", () => {
  it("skips occupied spots", () => {
    const spots = [spot(1, "A-01", true), spot(2, "A-02")];
    expect(nextAvailableSpot(spots)?.id).toBe(2);
  });
});

describe("spotIndexFromLabel", () => {
  it("parses trailing digits", () => {
    expect(spotIndexFromLabel("A-12")).toBe(12);
  });
});
