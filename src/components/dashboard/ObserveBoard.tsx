"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";

type Probe = {
  name: string;
  url: string;
  ok: boolean | null;
  ms: number | null;
  detail: string;
};

function probeOrigins() {
  const bff = (process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:4000").replace(/\/$/, "");
  const api = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api/v1";
  const go = api.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  return { bff, go };
}

async function hit(url: string): Promise<{ ok: boolean; ms: number; detail: string }> {
  const t0 = performance.now();
  try {
    const res = await fetch(url, { cache: "no-store", credentials: "omit", signal: AbortSignal.timeout(20_000) });
    const ms = Math.round(performance.now() - t0);
    const text = await res.text();
    return { ok: res.ok, ms, detail: text.slice(0, 120) || res.statusText };
  } catch (e) {
    return {
      ok: false,
      ms: Math.round(performance.now() - t0),
      detail: e instanceof Error ? e.message : "failed",
    };
  }
}

export function ObserveBoard({
  showGrafana = true,
}: {
  showGrafana?: boolean;
}) {
  const grafana = (process.env.NEXT_PUBLIC_GRAFANA_URL ?? "").replace(/\/$/, "");
  const metricsPublic = (process.env.NEXT_PUBLIC_METRICS_URL ?? "").replace(/\/$/, "");
  const { bff, go } = probeOrigins();
  const [probes, setProbes] = useState<Probe[]>([]);
  const [busy, setBusy] = useState(false);

  const run = useCallback(async () => {
    setBusy(true);
    const targets: { name: string; url: string }[] = [
      { name: "BFF /healthz", url: `${bff}/healthz` },
      { name: "BFF /readyz", url: `${bff}/readyz` },
      { name: "Go /healthz", url: `${go}/healthz` },
      { name: "Go /readyz", url: `${go}/readyz` },
    ];
    const results = await Promise.all(
      targets.map(async (t) => {
        const r = await hit(t.url);
        return { ...t, ok: r.ok, ms: r.ms, detail: r.detail };
      }),
    );
    setProbes(results);
    setBusy(false);
  }, [bff, go]);

  useEffect(() => {
    void run();
    const id = window.setInterval(() => void run(), 30_000);
    return () => window.clearInterval(id);
  }, [run]);

  const allOk = probes.length > 0 && probes.every((p) => p.ok);

  return (
    <div className="dash-observe">
      <div className="dash-panel">
        <div className="dash-chart__head dash-chart__head--row">
          <div>
            <h2>Live probes</h2>
            <p>Direct health checks · refresh every 30s</p>
          </div>
          <button
            type="button"
            className="console-btn console-btn--ghost console-btn--pill"
            disabled={busy}
            onClick={() => void run()}
          >
            {busy ? "Probing…" : "Probe now"}
          </button>
        </div>
        <div className="dash-observe__status">
          <Badge tone={allOk ? "success" : probes.some((p) => p.ok === false) ? "danger" : "muted"}>
            {allOk ? "All green" : busy ? "Checking" : "Degraded / cold"}
          </Badge>
        </div>
        <ul className="dash-probe-grid">
          {probes.map((p, i) => (
            <motion.li
              key={p.name}
              className={`dash-probe${p.ok === true ? " dash-probe--ok" : p.ok === false ? " dash-probe--bad" : ""}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="dash-probe__top">
                <strong>{p.name}</strong>
                <span className="font-mono">{p.ms != null ? `${p.ms}ms` : "—"}</span>
              </div>
              <p className="dash-probe__detail font-mono">{p.detail}</p>
            </motion.li>
          ))}
        </ul>
      </div>

      {showGrafana ? (
        <div className="dash-panel">
          <div className="dash-chart__head">
            <h2>Grafana · app observation</h2>
            <p>
              Scrape <code>/metrics</code> with <code>METRICS_TOKEN</code>. Embed URL via{" "}
              <code>NEXT_PUBLIC_GRAFANA_URL</code>.
            </p>
          </div>
          {grafana ? (
            <div className="dash-grafana">
              <iframe
                title="Grafana dashboard"
                src={grafana}
                className="dash-grafana__frame"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="dash-grafana dash-grafana--empty">
              <p>No Grafana URL configured.</p>
              <p className="dash-table__meta">
                Dashboard JSON ships in{" "}
                <code>SpotSync-server/deploy/grafana/dashboards/spotsync-api.json</code>.
                Set <code>NEXT_PUBLIC_GRAFANA_URL</code> to your panel share link.
              </p>
              {metricsPublic ? (
                <p>
                  <a href={metricsPublic} rel="noopener noreferrer" target="_blank">
                    Open metrics endpoint →
                  </a>
                </p>
              ) : (
                <p className="dash-table__meta">
                  Optional: <code>NEXT_PUBLIC_METRICS_URL</code> for a public metrics doc link.
                </p>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
