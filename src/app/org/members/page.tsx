"use client";

import { AppHeader } from "@/components/AppHeader";
import { AdminShell, ORG_NAV } from "@/components/dashboard/AdminShell";
import { MembersManager } from "@/components/dashboard/MembersManager";
import { useAuth } from "@/components/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { isPlatformAdmin } from "@/lib/auth/roles";
import Link from "next/link";

export default function OrgMembersPage() {
  const { user, token } = useAuth();
  const orgQuery = useQuery({
    queryKey: ["org-me"],
    queryFn: () => api.orgMe(token),
    enabled: !!user && !isPlatformAdmin(user.role),
  });

  const orgId = orgQuery.data?.id;

  return (
    <div className="shell">
      <AppHeader tag="Members" />
      <main className="shell-main shell-main--wide">
        <AdminShell
          eyebrow="Organization"
          title="Members"
          subtitle="Attach drivers and operators to your org."
          nav={ORG_NAV}
        >
          {isPlatformAdmin(user?.role) ? (
            <p className="dash-empty">
              Platform admins manage members from an org context. Open{" "}
              <Link href="/platform/orgs">Organizations</Link>, or sign in as org_admin.
            </p>
          ) : orgQuery.isLoading ? (
            <p>Loading org…</p>
          ) : orgId ? (
            <MembersManager orgId={orgId} token={token} />
          ) : (
            <p className="dash-empty">No organization linked to this account.</p>
          )}
        </AdminShell>
      </main>
    </div>
  );
}
