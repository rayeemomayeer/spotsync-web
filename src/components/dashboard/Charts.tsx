"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";

/** Interactive SVG bar chart — capacity vs free per zone. */
export function ZoneCapacityBars({
  rows,
}: {
  rows: { name: string; capacity: number; available: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.capacity));
  const trimmed = rows.slice(0, 8);

  if (trimmed.length === 0) {
    return <p className="dash-empty">No zones to chart yet.</p>;
  }

  return (
    <div className="dash-chart">
      <div className="dash-chart__head">
        <h2>Capacity by zone</h2>
        <p>Available vs total · hover for numbers</p>
      </div>
      <ul className="dash-bars" role="list">
        {trimmed.map((row, i) => {
          const occ = Math.max(0, row.capacity - row.available);
          const freePct = (row.available / max) * 100;
          const occPct = (occ / max) * 100;
          return (
            <li key={row.name} className="dash-bars__row">
              <span className="dash-bars__label" title={row.name}>
                {row.name}
              </span>
              <div className="dash-bars__track" title={`${row.available} free / ${row.capacity}`}>
                <motion.span
                  className="dash-bars__occ"
                  initial={{ width: 0 }}
                  animate={{ width: `${occPct}%` }}
                  transition={{ delay: 0.08 * i, duration: 0.55, ease: "easeOut" }}
                />
                <motion.span
                  className="dash-bars__free"
                  initial={{ width: 0 }}
                  animate={{ width: `${freePct}%` }}
                  transition={{ delay: 0.08 * i + 0.05, duration: 0.55, ease: "easeOut" }}
                />
              </div>
              <span className="dash-bars__meta font-mono">
                {row.available}/{row.capacity}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="dash-chart__legend">
        <span>
          <i className="dash-dot dash-dot--occ" /> Occupied
        </span>
        <span>
          <i className="dash-dot dash-dot--free" /> Free
        </span>
      </div>
    </div>
  );
}

/** Smooth area spark for reservation volume over synthetic day buckets. */
export function ReservationSpark({
  series,
  label = "Reservation pulse",
}: {
  series: number[];
  label?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const path = useMemo(() => {
    if (series.length < 2) return "";
    const w = 320;
    const h = 96;
    const max = Math.max(1, ...series);
    const step = w / (series.length - 1);
    const pts = series.map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 8) - 4;
      return [x, y] as const;
    });
    const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const area = `${line} L${w},${h} L0,${h} Z`;
    return { line, area, w, h };
  }, [series]);

  if (!path) return <p className="dash-empty">Not enough reservation samples.</p>;

  return (
    <div className="dash-chart dash-chart--spark">
      <div className="dash-chart__head">
        <h2>{label}</h2>
        <p>Recent activity · derived from live rows</p>
      </div>
      <svg
        className="dash-spark"
        viewBox={`0 0 ${path.w} ${path.h}`}
        role="img"
        aria-label={label}
      >
        <defs>
          <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={path.area}
          fill={`url(#fill-${gid})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        <motion.path
          d={path.line}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

export function OccupancyRing({
  available,
  capacity,
  label = "Fleet free",
}: {
  available: number;
  capacity: number;
  label?: string;
}) {
  const pct = capacity > 0 ? available / capacity : 0;
  const r = 54;
  const c = 2 * Math.PI * r;
  const dash = c * pct;

  return (
    <div className="dash-ring">
      <svg viewBox="0 0 140 140" className="dash-ring__svg" aria-hidden>
        <circle cx="70" cy="70" r={r} className="dash-ring__track" />
        <motion.circle
          cx="70"
          cy="70"
          r={r}
          className="dash-ring__value"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 70 70)"
          initial={{ strokeDasharray: `0 ${c}` }}
          animate={{ strokeDasharray: `${dash} ${c}` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="dash-ring__center">
        <strong className="font-mono">{Math.round(pct * 100)}%</strong>
        <span>{label}</span>
        <span className="dash-ring__meta font-mono">
          {available}/{capacity}
        </span>
      </div>
    </div>
  );
}

/** Bucket reservation timestamps into N bins for a spark chart. */
export function bucketByHour(
  dates: string[],
  buckets = 12,
): number[] {
  if (dates.length === 0) return Array.from({ length: buckets }, () => 0);
  const times = dates.map((d) => new Date(d).getTime()).filter((t) => !Number.isNaN(t));
  if (times.length === 0) return Array.from({ length: buckets }, () => 0);
  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = Math.max(1, max - min);
  const out = Array.from({ length: buckets }, () => 0);
  for (const t of times) {
    const idx = Math.min(buckets - 1, Math.floor(((t - min) / span) * buckets));
    out[idx] += 1;
  }
  return out;
}
