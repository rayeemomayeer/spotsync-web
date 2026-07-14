"use client";

import { AppHeader } from "@/components/AppHeader";
import { AdminShell, ORG_NAV } from "@/components/dashboard/AdminShell";
import { AuditTrail } from "@/components/dashboard/AuditTrail";
import { useAuth } from "@/components/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { isPlatformAdmin } from "@/lib/auth/roles";

export default function OrgAuditPage() {
  const { user, token } = useAuth();
  const orgQuery = useQuery({
    queryKey: ["org-me"],
    queryFn: () => api.orgMe(token),
    enabled: !!user && !isPlatformAdmin(user.role),
  });

  return (
    <div className="shell">
      <AppHeader tag="Audit" />
      <main className="shell-main shell-main--wide">
        <AdminShell
          eyebrow="Organization"
          title="Audit"
          subtitle="Who changed what — org scoped."
          nav={ORG_NAV}
        >
          <AuditTrail
            token={token}
            organizationId={isPlatformAdmin(user?.role) ? undefined : orgQuery.data?.id}
          />
        </AdminShell>
      </main>
    </div>
  );
}
