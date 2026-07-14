import { describe, expect, it } from "vitest";
import { isOfflineSpotData, normalizeShowcaseSpots, patchSpotOccupied, patchSpotReleased } from "./showcase-spots";
import { offlineShowcaseSpots } from "./offline-fallback";

describe("isOfflineSpotData", () => {
  it("detects offline demo spots by zone_id 0", () => {
    expect(isOfflineSpotData(offlineShowcaseSpots())).toBe(true);
  });

  it("returns false for API spots", () => {
    const api = offlineShowcaseSpots().map((s) => ({ ...s, zone_id: 5, created_at: "2024-01-01" }));
    expect(isOfflineSpotData(api)).toBe(false);
  });
});

describe("normalizeShowcaseSpots", () => {
  it("returns empty when API has no spots (do not invent fake ids)", () => {
    const spots = normalizeShowcaseSpots([], 9);
    expect(spots).toEqual([]);
  });

  it("stamps zone_id on live api spots", () => {
    const spots = normalizeShowcaseSpots(
      [{ ...offlineShowcaseSpots()[0], id: 93, zone_id: 4, created_at: "x" }],
      4,
    );
    expect(spots).toHaveLength(1);
    expect(spots[0].id).toBe(93);
    expect(spots[0].zone_id).toBe(4);
  });
});

describe("patchSpotOccupied", () => {
  it("toggles occupied flag on matching id", () => {
    const spots = offlineShowcaseSpots();
    const patched = patchSpotOccupied(spots, 3, true);
    expect(patched.find((s) => s.id === 3)?.occupied).toBe(true);
    expect(patched.find((s) => s.id === 4)?.occupied).toBe(false);
  });
});

describe("patchSpotReleased", () => {
  it("marks spot available after release", () => {
    const spots = patchSpotOccupied(offlineShowcaseSpots(), 2, true);
    const released = patchSpotReleased(spots, 2);
    expect(released.find((s) => s.id === 2)?.occupied).toBe(false);
  });
});
