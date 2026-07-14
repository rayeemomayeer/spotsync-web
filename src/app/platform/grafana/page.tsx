"use client";

import { AppHeader } from "@/components/AppHeader";
import { AdminShell, PLATFORM_NAV } from "@/components/dashboard/AdminShell";
import { GrafanaDashboard } from "@/components/dashboard/GrafanaDashboard";

/** Dedicated Grafana workspace — same panels as Observe. */
export default function PlatformGrafanaPage() {
  return (
    <div className="shell">
      <AppHeader tag="Grafana" />
      <main className="shell-main shell-main--wide">
        <AdminShell
          eyebrow="Platform"
          title="Grafana"
          subtitle="SpotSync API dashboard — p95 latency, oversell, cache, outbox DLQ."
          nav={PLATFORM_NAV}
        >
          <div className="dash-panel">
            <GrafanaDashboard />
          </div>
        </AdminShell>
      </main>
    </div>
  );
}
