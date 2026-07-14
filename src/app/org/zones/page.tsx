"use client";

import { AppHeader } from "@/components/AppHeader";
import { AdminShell, ORG_NAV } from "@/components/dashboard/AdminShell";
import { ZoneManager } from "@/components/dashboard/ZoneManager";
import { useAuth } from "@/components/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { isPlatformAdmin } from "@/lib/auth/roles";

export default function OrgZonesPage() {
  const { user, token } = useAuth();
  const orgQuery = useQuery({
    queryKey: ["org-me"],
    queryFn: () => api.orgMe(token),
    enabled: !!user && !isPlatformAdmin(user.role),
  });

  return (
    <div className="shell">
      <AppHeader tag="Zones" />
      <main className="shell-main shell-main--wide">
        <AdminShell
          eyebrow="Organization"
          title="Zones"
          subtitle="Create and edit parking inventory — capacity feeds live search."
          nav={ORG_NAV}
        >
          <ZoneManager
            token={token}
            filterOrgId={isPlatformAdmin(user?.role) ? undefined : orgQuery.data?.id}
          />
        </AdminShell>
      </main>
    </div>
  );
}
