"use client";

import { AppHeader } from "@/components/AppHeader";
import { AdminShell, PLATFORM_NAV } from "@/components/dashboard/AdminShell";
import { ZoneManager } from "@/components/dashboard/ZoneManager";
import { useAuth } from "@/components/providers/AuthProvider";

export default function PlatformZonesPage() {
  const { token } = useAuth();

  return (
    <div className="shell">
      <AppHeader tag="Zones" />
      <main className="shell-main shell-main--wide">
        <AdminShell
          eyebrow="Platform"
          title="Zones"
          subtitle="Marketplace inventory — platform creates are global unless assigned via org admin flow."
          nav={PLATFORM_NAV}
        >
          <ZoneManager token={token} title="All zones" />
        </AdminShell>
      </main>
    </div>
  );
}
