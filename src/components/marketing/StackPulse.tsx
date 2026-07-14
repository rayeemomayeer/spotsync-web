"use client";

import { useEffect, useState } from "react";

type Probe = { name: string; ok: boolean | null; detail: string };

function goOrigin(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api/v1";
  return base.replace(/\/api\/v1\/?$/, "");
}

function bffOrigin(): string {
  return (process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

async function probe(name: string, url: string): Promise<Probe> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    return { name, ok: res.ok, detail: res.ok ? `${res.status} OK` : `${res.status}` };
  } catch {
    return { name, ok: false, detail: "unreachable" };
  } finally {
    clearTimeout(timer);
  }
}

export function StackPulse() {
  const [probes, setProbes] = useState<Probe[]>([
    { name: "Go /healthz", ok: null, detail: "…" },
    { name: "Go /readyz", ok: null, detail: "…" },
    { name: "BFF /healthz", ok: null, detail: "…" },
  ]);

  useEffect(() => {
    const go = goOrigin();
    const bff = bffOrigin();
    void Promise.all([
      probe("Go /healthz", `${go}/healthz`),
      probe("Go /readyz", `${go}/readyz`),
      probe("BFF /healthz", `${bff}/healthz`),
    ]).then(setProbes);
  }, []);

  const live = probes.filter((p) => p.ok === true).length;
  const total = probes.length;

  return (
    <section className="stack-pulse" aria-labelledby="stack-pulse-heading">
      <div className="stack-pulse__intro">
        <p className="stack-pulse__eyebrow">Infrastructure</p>
        <h2 id="stack-pulse-heading" className="stack-pulse__title">
          Stack pulse
        </h2>
        <p className="stack-pulse__lede">
          Live probes against the Go reservation engine and Express BFF — same checks platform
          admins see on <code>/platform/health</code>.
        </p>
      </div>

      <p className="stack-pulse__score">
        <span className="font-mono">
          {live}/{total}
        </span>{" "}
        reachable
      </p>

      <ul className="stack-pulse__list">
        {probes.map((p) => (
          <li key={p.name} className="stack-pulse__row">
            <span
              className={`stack-pulse__dot${
                p.ok === true ? " stack-pulse__dot--ok" : p.ok === false ? " stack-pulse__dot--bad" : ""
              }`}
              aria-hidden
            />
            <span className="stack-pulse__name">{p.name}</span>
            <span className="stack-pulse__detail font-mono">{p.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
