import { describe, expect, it } from "vitest";
import { goOrigin } from "./probe-origins";

describe("goOrigin", () => {
  it("does not collapse BFF api base into BFF as Go", () => {
    // env is fixed at module load in real app; this asserts fallback constants shape.
    const origin = goOrigin();
    expect(origin.length).toBeGreaterThan(0);
    expect(origin.includes("/api/v1")).toBe(false);
  });
});
