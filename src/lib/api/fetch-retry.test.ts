import { describe, expect, it } from "vitest";
import { ColdStartError, isColdStartFailure, toAuthUserMessage } from "./fetch-retry";

describe("cold-start helpers", () => {
  it("detects gateway statuses", () => {
    expect(isColdStartFailure(null, 504)).toBe(true);
    expect(isColdStartFailure(null, 503)).toBe(true);
    expect(isColdStartFailure(null, 401)).toBe(false);
  });

  it("maps AbortError to friendly auth copy", () => {
    const abort = new Error("The operation was aborted due to timeout");
    abort.name = "TimeoutError";
    expect(toAuthUserMessage(abort)).toMatch(/waking from free-tier/i);
  });

  it("preserves real auth errors", () => {
    expect(toAuthUserMessage(new Error("Invalid email or password"))).toBe(
      "Invalid email or password",
    );
  });

  it("handles ColdStartError", () => {
    expect(toAuthUserMessage(new ColdStartError("x", 504))).toMatch(/waking/);
  });
});
