"use client";

import { AppHeader } from "@/components/AppHeader";
import { AdminShell, PLATFORM_NAV } from "@/components/dashboard/AdminShell";
import { ObserveBoard } from "@/components/dashboard/ObserveBoard";

export default function PlatformObservePage() {
  return (
    <div className="shell">
      <AppHeader tag="Observe" />
      <main className="shell-main shell-main--wide">
        <AdminShell
          eyebrow="Platform"
          title="Observe"
          subtitle="Health probes, cold-start signals, Grafana observability."
          nav={PLATFORM_NAV}
        >
          <ObserveBoard showGrafana />
        </AdminShell>
      </main>
    </div>
  );
}
