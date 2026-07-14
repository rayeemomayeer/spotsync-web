"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { SpotSyncMetricsSnapshot } from "@/lib/metrics/prom";
import { Badge } from "@/components/ui/Badge";

type HistoryPoint = {
  t: number;
  p95: number | null;
  oversell: number;
  hitRatio: number | null;
  dlq: number;
};

type MetricsPayload = {
  snapshot: SpotSyncMetricsSnapshot;
  source: string;
  panels: string[];
};

function formatSec(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  if (v < 0.001) return `${(v * 1000).toFixed(2)}ms`;
  if (v < 1) return `${(v * 1000).toFixed(0)}ms`;
  return `${v.toFixed(3)}s`;
}

function formatRatio(v: number | null): string {
  if (v == null) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function MetricSpark({
  series,
  label,
}: {
  series: number[];
  label: string;
}) {
  const gid = useId().replace(/:/g, "");
  const path = useMemo(() => {
    if (series.length < 2) return null;
    const w = 280;
    const h = 72;
    const max = Math.max(1e-9, ...series);
    const min = Math.min(...series);
    const span = Math.max(1e-9, max - min);
    const step = w / (series.length - 1);
    const pts = series.map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / span) * (h - 8) - 4;
      return [x, y] as const;
    });
    const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const area = `${line} L${w},${h} L0,${h} Z`;
    return { line, area, w, h };
  }, [series]);

  if (!path) {
    return <p className="dash-empty dash-empty--sm">Collecting samples…</p>;
  }

  return (
    <svg className="dash-spark dash-spark--grafana" viewBox={`0 0 ${path.w} ${path.h}`} role="img" aria-label={label}>
      <defs>
        <linearGradient id={`gf-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path.area} fill={`url(#gf-${gid})`} />
      <path d={path.line} fill="none" stroke="var(--color-brand)" strokeWidth="2" />
    </svg>
  );
}

export function GrafanaDashboard() {
  const grafanaEmbed = (process.env.NEXT_PUBLIC_GRAFANA_URL ?? "").replace(/\/$/, "");
  const [snap, setSnap] = useState<SpotSyncMetricsSnapshot | null>(null);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/platform/metrics", { cache: "no-store" });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: MetricsPayload;
      };
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "metrics failed");
      }
      const next = json.data.snapshot;
      setSnap(next);
      setSource(json.data.source);
      setHistory((prev) => {
        const point: HistoryPoint = {
          t: Date.now(),
          p95: next.reservationLatencyP95Sec,
          oversell: next.oversellRejected,
          hitRatio: next.cacheHitRatio,
          dlq: next.outboxDeadLetters,
        };
        return [...prev, point].slice(-24);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "metrics failed");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 20_000);
    return () => window.clearInterval(id);
  }, [load]);

  const p95Series = history.map((h) => h.p95 ?? 0);
  const oversellSeries = history.map((h) => h.oversell);
  const ratioSeries = history.map((h) => (h.hitRatio != null ? h.hitRatio * 100 : 0));
  const dlqSeries = history.map((h) => h.dlq);

  return (
    <div className="dash-grafana-board">
      <div className="dash-chart__head dash-chart__head--row">
        <div>
          <h2>Grafana · SpotSync API</h2>
          <p>
            Live panels from Prometheus <code>/metrics</code>
            {source ? (
              <>
                {" "}
                · <code>{source}</code>
              </>
            ) : null}
            . Matches{" "}
            <code>deploy/grafana/dashboards/spotsync-api.json</code>.
          </p>
        </div>
        <div className="dash-grafana-board__tools">
          <Badge tone={error ? "danger" : snap ? "success" : "muted"}>
            {error ? "Upstream error" : busy && !snap ? "Loading" : "Live"}
          </Badge>
          <button
            type="button"
            className="console-btn console-btn--ghost console-btn--pill"
            disabled={busy}
            onClick={() => void load()}
          >
            {busy ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error ? <p className="auth-card__error">{error}</p> : null}

      <div className="dash-grafana-grid">
        <article className="dash-grafana-panel">
          <header>
            <h3>Reserve p95 latency</h3>
            <strong className="font-mono">{formatSec(snap?.reservationLatencyP95Sec ?? null)}</strong>
          </header>
          <p className="dash-table__meta">
            Avg {formatSec(snap?.reservationLatencyAvgSec ?? null)} · n=
            {snap?.reservationCount ?? 0}
          </p>
          <MetricSpark series={p95Series} label="Reserve p95" />
        </article>

        <article className="dash-grafana-panel">
          <header>
            <h3>Oversell rejections</h3>
            <strong className="font-mono">{snap?.oversellRejected ?? "—"}</strong>
          </header>
          <p className="dash-table__meta">Counter · zone-full 409s</p>
          <MetricSpark series={oversellSeries} label="Oversell" />
        </article>

        <article className="dash-grafana-panel">
          <header>
            <h3>Zone cache hit ratio</h3>
            <strong className="font-mono">{formatRatio(snap?.cacheHitRatio ?? null)}</strong>
          </header>
          <p className="dash-table__meta">
            Hits {snap?.cacheHits ?? 0} · misses {snap?.cacheMisses ?? 0}
          </p>
          <MetricSpark series={ratioSeries} label="Cache hit %" />
        </article>

        <article className="dash-grafana-panel">
          <header>
            <h3>Outbox dead letters</h3>
            <strong className="font-mono">{snap?.outboxDeadLetters ?? "—"}</strong>
          </header>
          <p className="dash-table__meta">DLQ · increase over uptime</p>
          <MetricSpark series={dlqSeries} label="DLQ" />
        </article>
      </div>

      {grafanaEmbed ? (
        <motion.div
          className="dash-grafana"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <iframe
            title="External Grafana"
            src={grafanaEmbed}
            className="dash-grafana__frame"
            loading="lazy"
            referrerPolicy="no-referrer"
            allow="fullscreen"
          />
        </motion.div>
      ) : (
        <p className="dash-table__meta">
          Optional: set <code>NEXT_PUBLIC_GRAFANA_URL</code> to embed Grafana Cloud. Server{" "}
          <code>METRICS_TOKEN</code> used when Go metrics are gated.
        </p>
      )}
    </div>
  );
}
