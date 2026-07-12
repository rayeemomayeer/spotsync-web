"use client";

import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { isOrgAdmin, isPlatformAdmin } from "@/lib/auth/roles";

export default function OrgPage() {
  const { user, loading } = useAuth();
  const allowed = user && (isOrgAdmin(user.role) || isPlatformAdmin(user.role));

  return (
    <div className="shell">
      <AppHeader tag="Org" showAuthCta={!user} />
      <main className="shell-main">
        <div className="shell-card">
          <h1>Org operations</h1>
          {loading ? (
            <p>Loading session…</p>
          ) : !user ? (
            <p>
              Sign in as an org admin. <Link href="/login">Sign in</Link>
            </p>
          ) : !allowed ? (
            <p>Role gate: need org_admin (or platform admin). Your role: {user.role}</p>
          ) : (
            <>
              <p>Manage your zones — dense ops surface. Zone list wiring comes via BFF next.</p>
              <ul className="console-zone-list" style={{ marginBottom: "1rem" }}>
                <li className="shell-card" style={{ boxShadow: "none" }}>
                  <strong>Zones</strong>
                  <p style={{ margin: "0.35rem 0 0" }}>Placeholder — your org zones will list here.</p>
                </li>
              </ul>
              <Link href="/console">Open live console →</Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
