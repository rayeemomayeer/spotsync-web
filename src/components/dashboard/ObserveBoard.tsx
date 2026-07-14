"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { GrafanaDashboard } from "@/components/dashboard/GrafanaDashboard";
import { fetchWithColdStartRetry } from "@/lib/api/fetch-retry";
import { bffOrigin, goOrigin } from "@/lib/api/probe-origins";

type Probe = {
  name: string;
  url: string;
  ok: boolean | null;
  ms: number | null;
  detail: string;
};

async function hit(url: string): Promise<{ ok: boolean; ms: number; detail: string }> {
  const t0 = performance.now();
  try {
    const res = await fetchWithColdStartRetry(
      url,
      { cache: "no-store", credentials: "omit" },
      { attempts: 4, timeoutMs: 60_000 },
    );
    const ms = Math.round(performance.now() - t0);
    const text = await res.text();
    return { ok: res.ok, ms, detail: text.slice(0, 120) || res.statusText };
  } catch (e) {
    return {
      ok: false,
      ms: Math.round(performance.now() - t0),
      detail: e instanceof Error ? e.message : "unreachable",
    };
  }
}

export function ObserveBoard({
  showGrafana = true,
}: {
  showGrafana?: boolean;
}) {
  const bff = bffOrigin();
  const go = goOrigin();
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
    const id = window.setInterval(() => void run(), 45_000);
    return () => window.clearInterval(id);
  }, [run]);

  const allOk = probes.length > 0 && probes.every((p) => p.ok);

  return (
    <div className="dash-observe">
      <div className="dash-panel">
        <div className="dash-chart__head dash-chart__head--row">
          <div>
            <h2>Live probes</h2>
            <p>
              Direct health checks · Go at <code>{go}</code> · retries cold starts
            </p>
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
            {allOk ? "All green" : busy ? "Checking / waking" : "Degraded / cold"}
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
        <div className="dash-panel" id="grafana">
          <GrafanaDashboard />
        </div>
      ) : null}
    </div>
  );
}
