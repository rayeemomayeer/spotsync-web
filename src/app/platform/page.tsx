"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api/client";
import { formatCents } from "@/lib/checkout/client";

export default function PlatformOverviewPage() {
  const { token } = useAuth();

  const orgsQuery = useQuery({
    queryKey: ["platform-orgs"],
    queryFn: () => api.orgs(token),
    enabled: !!token,
  });
  const zonesQuery = useQuery({
    queryKey: ["platform-zones"],
    queryFn: () => api.zones(),
  });
  const resQuery = useQuery({
    queryKey: ["platform-reservations"],
    queryFn: () => api.allReservations(token ?? "", 1, 50),
    enabled: !!token,
  });

  const orgs = orgsQuery.data ?? [];
  const pending = orgs.filter((o) => o.status === "pending").length;
  const subscribed = orgs.filter((o) => o.billing_plan).length;
  const zones = zonesQuery.data ?? [];
  const reservations = resQuery.data?.items ?? [];
  const activeRes = reservations.filter((r) => r.status === "active").length;
  const testMrrCents = orgs.reduce((sum, o) => {
    if (o.billing_plan === "growth") return sum + 14900;
    if (o.billing_plan === "starter") return sum + 4900;
    return sum;
  }, 0);

  return (
    <div className="shell">
      <AppHeader tag="Platform" />
      <main className="shell-main">
        <div className="shell-card">
          <PlatformShell title="Platform overview">
            <ul className="platform-kpi">
              <li>
                <span className="platform-kpi__value">{orgs.length}</span>
                <span className="platform-kpi__label">Organizations</span>
              </li>
              <li>
                <span className="platform-kpi__value">{pending}</span>
                <span className="platform-kpi__label">Pending approval</span>
              </li>
              <li>
                <span className="platform-kpi__value">{subscribed}</span>
                <span className="platform-kpi__label">Subscribed orgs</span>
              </li>
              <li>
                <span className="platform-kpi__value">{zones.length}</span>
                <span className="platform-kpi__label">Zones live</span>
              </li>
              <li>
                <span className="platform-kpi__value">{activeRes}</span>
                <span className="platform-kpi__label">Active reservations</span>
              </li>
              <li>
                <span className="platform-kpi__value">{formatCents(testMrrCents)}</span>
                <span className="platform-kpi__label">Test MRR (demo)</span>
              </li>
            </ul>

            {pending > 0 ? (
              <p>
                <Link href="/platform/orgs" className="console-btn console-btn--primary">
                  Review {pending} pending org{pending === 1 ? "" : "s"}
                </Link>
              </p>
            ) : null}

            <p style={{ marginTop: "1rem" }}>
              <Link href="/console">Open live console →</Link>
            </p>
          </PlatformShell>
        </div>
      </main>
    </div>
  );
}
