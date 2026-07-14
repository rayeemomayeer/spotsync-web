"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { AdminShell, PLATFORM_NAV } from "@/components/dashboard/AdminShell";
import {
  OccupancyRing,
  ReservationSpark,
  ZoneCapacityBars,
  bucketByHour,
} from "@/components/dashboard/Charts";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api/client";
import { formatCents } from "@/lib/checkout/client";

export default function PlatformOverviewPage() {
  const { user, token } = useAuth();

  const orgsQuery = useQuery({
    queryKey: ["platform-orgs"],
    queryFn: () => api.orgs(token),
    enabled: !!user,
  });
  const zonesQuery = useQuery({
    queryKey: ["admin-zones"],
    queryFn: () => api.zones(),
    enabled: !!user,
  });
  const resQuery = useQuery({
    queryKey: ["platform-reservations"],
    queryFn: () => api.allReservations(token ?? "", 1, 100),
    enabled: !!user,
  });

  const orgs = orgsQuery.data ?? [];
  const pending = orgs.filter((o) => o.status === "pending").length;
  const subscribed = orgs.filter((o) => o.billing_plan).length;
  const zones = zonesQuery.data ?? [];
  const reservations = resQuery.data?.items ?? [];
  const activeRes = reservations.filter((r) => r.status === "active").length;
  const capacity = zones.reduce((s, z) => s + z.total_capacity, 0);
  const available = zones.reduce((s, z) => s + z.available_spots, 0);
  const testMrrCents = orgs.reduce((sum, o) => {
    if (o.billing_plan === "growth") return sum + 14900;
    if (o.billing_plan === "starter") return sum + 4900;
    return sum;
  }, 0);
  const spark = bucketByHour(reservations.map((r) => r.created_at));

  const statusBars = [
    { name: "Active orgs", capacity: Math.max(orgs.length, 1), available: orgs.filter((o) => o.status === "active").length },
    { name: "Pending", capacity: Math.max(orgs.length, 1), available: pending },
    { name: "Subscribed", capacity: Math.max(orgs.length, 1), available: subscribed },
  ];

  return (
    <div className="shell">
      <AppHeader tag="Platform" />
      <main className="shell-main shell-main--wide">
        <AdminShell
          eyebrow="Platform"
          title="Marketplace control"
          subtitle="Organizations, inventory, and reservation heat — saas_admin."
          nav={PLATFORM_NAV}
        >
          <StatGrid
            items={[
              { label: "Organizations", value: orgs.length, tone: "brand" },
              { label: "Pending", value: pending, tone: pending ? "warn" : "default" },
              { label: "Subscribed", value: subscribed, tone: "success" },
              { label: "Zones", value: zones.length },
              { label: "Active reservations", value: activeRes },
              { label: "Test MRR", value: formatCents(testMrrCents), hint: "demo" },
            ]}
          />

          <div className="dash-grid-2">
            <ZoneCapacityBars
              rows={zones.slice(0, 8).map((z) => ({
                name: z.name,
                capacity: z.total_capacity,
                available: z.available_spots,
              }))}
            />
            <div className="dash-stack">
              <OccupancyRing available={available} capacity={capacity} label="Network free" />
              <ReservationSpark series={spark} label="Reservation pulse" />
              <div className="dash-chart">
                <div className="dash-chart__head">
                  <h2>Org funnel</h2>
                  <p>Active · pending · billed</p>
                </div>
                <ZoneCapacityBars rows={statusBars} />
              </div>
            </div>
          </div>

          <div className="dash-cta-row">
            {pending > 0 ? (
              <Link href="/platform/orgs" className="console-btn console-btn--primary console-btn--pill">
                Review {pending} pending
              </Link>
            ) : (
              <Link href="/platform/orgs" className="console-btn console-btn--primary console-btn--pill">
                Organizations
              </Link>
            )}
            <Link href="/platform/zones" className="console-btn console-btn--ghost console-btn--pill">
              Create zone
            </Link>
            <Link href="/platform/observe" className="console-btn console-btn--ghost console-btn--pill">
              Observe stack
            </Link>
            <Link href="/platform/grafana" className="console-btn console-btn--ghost console-btn--pill">
              Grafana metrics
            </Link>
            <Link href="/console" className="console-btn console-btn--ghost console-btn--pill">
              Console
            </Link>
          </div>
        </AdminShell>
      </main>
    </div>
  );
}
