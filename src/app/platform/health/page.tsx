"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { getBffUrl } from "@/lib/auth/client";

type Check = { name: string; url: string; ok: boolean | null; detail: string };

async function ping(url: string): Promise<{ ok: boolean; detail: string }> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    return { ok: res.ok, detail: `${res.status} ${text.slice(0, 80)}` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "unreachable" };
  }
}

export default function PlatformHealthPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [busy, setBusy] = useState(false);

  async function runChecks() {
    setBusy(true);
    const bff = getBffUrl();
    const goBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api/v1").replace(
      /\/api\/v1\/?$/,
      "",
    );
    const targets: Check[] = [
      { name: "BFF healthz", url: `${bff}/healthz`, ok: null, detail: "" },
      { name: "BFF readyz", url: `${bff}/readyz`, ok: null, detail: "" },
      { name: "Go healthz", url: `${goBase}/healthz`, ok: null, detail: "" },
      { name: "Go readyz", url: `${goBase}/readyz`, ok: null, detail: "" },
    ];
    const results: Check[] = [];
    for (const t of targets) {
      const r = await ping(t.url);
      results.push({ ...t, ok: r.ok, detail: r.detail });
    }
    setChecks(results);
    setBusy(false);
  }

  useEffect(() => {
    void runChecks();
  }, []);

  return (
    <div className="shell">
      <AppHeader tag="Health" />
      <main className="shell-main">
        <div className="shell-card">
          <PlatformShell title="Service health">
            <button type="button" className="console-btn console-btn--ghost" disabled={busy} onClick={() => void runChecks()}>
              {busy ? "Checking…" : "Refresh checks"}
            </button>
            <ul className="console-zone-list" style={{ marginTop: "1rem" }}>
              {checks.map((c) => (
                <li key={c.url} className="shell-card" style={{ boxShadow: "none" }}>
                  <strong>
                    {c.name}{" "}
                    {c.ok === null ? "" : c.ok ? (
                      <span style={{ color: "var(--ok, #1a7f37)" }}>OK</span>
                    ) : (
                      <span className="auth-card__error" style={{ display: "inline" }}>
                        DOWN
                      </span>
                    )}
                  </strong>
                  <p style={{ margin: "0.35rem 0", fontSize: "0.85rem" }}>
                    <a href={c.url} target="_blank" rel="noopener noreferrer">
                      {c.url}
                    </a>
                  </p>
                  {c.detail ? <code style={{ fontSize: "0.75rem" }}>{c.detail}</code> : null}
                </li>
              ))}
            </ul>
            <p>
              <Link href="/platform">← Overview</Link>
            </p>
          </PlatformShell>
        </div>
      </main>
    </div>
  );
}
