/** Minimal Prometheus text exposition parser for SpotSync custom metrics. */

export type PromSample = {
  name: string;
  labels: Record<string, string>;
  value: number;
};

export type SpotSyncMetricsSnapshot = {
  fetchedAt: string;
  oversellRejected: number;
  outboxDeadLetters: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRatio: number | null;
  reservationCount: number;
  reservationLatencyAvgSec: number | null;
  /** Approximate p95 from histogram buckets (reservation POST). */
  reservationLatencyP95Sec: number | null;
};

export function parsePromText(raw: string): PromSample[] {
  const out: PromSample[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)(\{[^}]*\})?\s+([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|NaN|[+-]?Inf)$/);
    if (!m) continue;
    const name = m[1];
    const labels = m[2] ? parseLabels(m[2]) : {};
    const value = Number(m[3]);
    if (!Number.isFinite(value)) continue;
    out.push({ name, labels, value });
  }
  return out;
}

function parseLabels(brace: string): Record<string, string> {
  const inner = brace.slice(1, -1);
  const labels: Record<string, string> = {};
  const re = /([a-zA-Z_][a-zA-Z0-9_]*)="((?:\\.|[^"\\])*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(inner))) {
    labels[match[1]] = match[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return labels;
}

function sumByName(samples: PromSample[], name: string): number {
  return samples.filter((s) => s.name === name).reduce((a, s) => a + s.value, 0);
}

/** Classical histogram quantile from cumulative buckets (le → count). */
export function histogramQuantile(q: number, buckets: { le: number; count: number }[]): number | null {
  if (buckets.length === 0 || q <= 0 || q > 1) return null;
  const sorted = [...buckets].sort((a, b) => a.le - b.le);
  const total = sorted[sorted.length - 1]?.count ?? 0;
  if (total <= 0) return null;
  const rank = q * total;
  let prevLe = 0;
  let prevCount = 0;
  for (const b of sorted) {
    if (b.count >= rank) {
      if (b.le === Infinity) return prevLe || b.le;
      const span = b.count - prevCount;
      if (span <= 0) return b.le;
      const frac = (rank - prevCount) / span;
      return prevLe + (b.le - prevLe) * frac;
    }
    prevLe = Number.isFinite(b.le) ? b.le : prevLe;
    prevCount = b.count;
  }
  return prevLe;
}

export function toSpotSyncSnapshot(samples: PromSample[], fetchedAt = new Date().toISOString()): SpotSyncMetricsSnapshot {
  const oversellRejected = sumByName(samples, "oversell_attempts_rejected_total");
  const outboxDeadLetters = sumByName(samples, "outbox_dead_lettered_total");
  const cacheHits = sumByName(samples, "zone_availability_cache_hits_total");
  const cacheMisses = sumByName(samples, "zone_availability_cache_misses_total");
  const cacheTotal = cacheHits + cacheMisses;
  const cacheHitRatio = cacheTotal > 0 ? cacheHits / cacheTotal : null;

  const latencySums = samples.filter((s) => s.name === "reservation_latency_seconds_sum");
  const latencyCounts = samples.filter((s) => s.name === "reservation_latency_seconds_count");
  const sum = latencySums.reduce((a, s) => a + s.value, 0);
  const count = latencyCounts.reduce((a, s) => a + s.value, 0);
  const reservationLatencyAvgSec = count > 0 ? sum / count : null;

  const bucketsByLe = new Map<number, number>();
  for (const s of samples) {
    if (s.name !== "reservation_latency_seconds_bucket") continue;
    if (s.labels.method && s.labels.method !== "POST") continue;
    const leRaw = s.labels.le;
    if (leRaw == null) continue;
    const le = leRaw === "+Inf" ? Infinity : Number(leRaw);
    if (!Number.isFinite(le) && le !== Infinity) continue;
    bucketsByLe.set(le, (bucketsByLe.get(le) ?? 0) + s.value);
  }
  const buckets = [...bucketsByLe.entries()].map(([le, c]) => ({ le, count: c }));
  const reservationLatencyP95Sec = histogramQuantile(0.95, buckets);

  return {
    fetchedAt,
    oversellRejected,
    outboxDeadLetters,
    cacheHits,
    cacheMisses,
    cacheHitRatio,
    reservationCount: count,
    reservationLatencyAvgSec,
    reservationLatencyP95Sec,
  };
}
