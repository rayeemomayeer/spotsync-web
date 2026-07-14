import { describe, expect, it } from "vitest";
import { histogramQuantile, parsePromText, toSpotSyncSnapshot } from "./prom";

const SAMPLE = `
# HELP oversell_attempts_rejected_total Total reservation attempts rejected because zone was full
# TYPE oversell_attempts_rejected_total counter
oversell_attempts_rejected_total 3
# HELP zone_availability_cache_hits_total Zone availability cache hits
# TYPE zone_availability_cache_hits_total counter
zone_availability_cache_hits_total 9
# HELP zone_availability_cache_misses_total Zone availability cache misses
# TYPE zone_availability_cache_misses_total counter
zone_availability_cache_misses_total 1
# HELP reservation_latency_seconds Reservation handler latency in seconds
# TYPE reservation_latency_seconds histogram
reservation_latency_seconds_bucket{method="POST",status="201",le="0.05"} 0
reservation_latency_seconds_bucket{method="POST",status="201",le="0.1"} 1
reservation_latency_seconds_bucket{method="POST",status="201",le="+Inf"} 1
reservation_latency_seconds_sum{method="POST",status="201"} 0.08
reservation_latency_seconds_count{method="POST",status="201"} 1
# HELP outbox_dead_lettered_total Outbox events moved to dead-letter queue
# TYPE outbox_dead_lettered_total counter
outbox_dead_lettered_total 2
`;

describe("parsePromText", () => {
  it("parses counters and histogram families", () => {
    const samples = parsePromText(SAMPLE);
    expect(samples.some((s) => s.name === "oversell_attempts_rejected_total")).toBe(true);
    expect(samples.find((s) => s.name === "reservation_latency_seconds_count")?.value).toBe(1);
  });
});

describe("toSpotSyncSnapshot", () => {
  it("computes cache ratio and p95", () => {
    const snap = toSpotSyncSnapshot(parsePromText(SAMPLE));
    expect(snap.oversellRejected).toBe(3);
    expect(snap.outboxDeadLetters).toBe(2);
    expect(snap.cacheHitRatio).toBeCloseTo(0.9);
    expect(snap.reservationLatencyAvgSec).toBeCloseTo(0.08);
    expect(snap.reservationLatencyP95Sec).toBeGreaterThan(0.05);
    expect(snap.reservationLatencyP95Sec).toBeLessThanOrEqual(0.1);
  });
});

describe("histogramQuantile", () => {
  it("returns null on empty", () => {
    expect(histogramQuantile(0.95, [])).toBeNull();
  });
});
