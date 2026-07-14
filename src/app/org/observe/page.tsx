"use client";

import { AppHeader } from "@/components/AppHeader";
import { AdminShell, ORG_NAV } from "@/components/dashboard/AdminShell";
import { ObserveBoard } from "@/components/dashboard/ObserveBoard";

export default function OrgObservePage() {
  return (
    <div className="shell">
      <AppHeader tag="Observe" />
      <main className="shell-main shell-main--wide">
        <AdminShell
          eyebrow="Organization"
          title="Observe"
          subtitle="Stack health for booking — cold starts show up here first."
          nav={ORG_NAV}
        >
          <ObserveBoard showGrafana />
        </AdminShell>
      </main>
    </div>
  );
}
