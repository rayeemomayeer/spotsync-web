"use client";

import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { isPlatformAdmin } from "@/lib/auth/roles";

export default function PlatformPage() {
  const { user, loading } = useAuth();
  const allowed = user && isPlatformAdmin(user.role);

  return (
    <div className="shell">
      <AppHeader tag="Platform" showAuthCta={!user} />
      <main className="shell-main">
        <div className="shell-card">
          <h1>Platform admin</h1>
          {loading ? (
            <p>Loading session…</p>
          ) : !user ? (
            <p>
              Sign in as saas_admin (legacy admin accepted). <Link href="/login">Sign in</Link>
            </p>
          ) : !allowed ? (
            <p>Role gate: saas_admin / admin only. Your role: {user.role}</p>
          ) : (
            <>
              <p>Manage orgs across the marketplace. Orgs list via BFF proxy — coming next.</p>
              <ul className="console-zone-list" style={{ marginBottom: "1rem" }}>
                <li className="shell-card" style={{ boxShadow: "none" }}>
                  <strong>Organizations</strong>
                  <p style={{ margin: "0.35rem 0 0" }}>Placeholder — org roster will load from BFF.</p>
                </li>
              </ul>
              <p>
                <Link href="/platform/billing">Billing (Stripe test) →</Link>
              </p>
              <Link href="/console">Open live console →</Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
