"use client";

import { useEffect, useState } from "react";
import { bffOrigin, goOrigin } from "@/lib/api/probe-origins";

type Probe = { name: string; ok: boolean | null; detail: string };

async function probe(name: string, url: string): Promise<Probe> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 55_000);
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
    let cancelled = false;
    const go = goOrigin();
    const bff = bffOrigin();

    async function run() {
      const next = await Promise.all([
        probe("Go /healthz", `${go}/healthz`),
        probe("Go /readyz", `${go}/readyz`),
        probe("BFF /healthz", `${bff}/healthz`),
      ]);
      if (!cancelled) setProbes(next);
      return next;
    }

    void (async () => {
      const first = await run();
      if (cancelled) return;
      // Free-tier cold start: one delayed retry if anything failed.
      if (first.some((p) => p.ok !== true)) {
        await new Promise((r) => setTimeout(r, 8_000));
        if (!cancelled) await run();
      }
    })();

    return () => {
      cancelled = true;
    };
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
          admins see on <code>/platform/observe</code>.
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
