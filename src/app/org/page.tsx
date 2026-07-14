"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { AdminShell, ORG_NAV } from "@/components/dashboard/AdminShell";
import { EntitlementBanner } from "@/components/dashboard/EntitlementBanner";
import {
  OccupancyRing,
  ReservationSpark,
  ZoneCapacityBars,
  bucketByHour,
} from "@/components/dashboard/Charts";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api/client";
import { isPlatformAdmin } from "@/lib/auth/roles";
import { orgEntitlement } from "@/lib/org/entitlement";

export default function OrgOverviewPage() {
  const { user, token } = useAuth();

  const orgQuery = useQuery({
    queryKey: ["org-me"],
    queryFn: () => api.orgMe(token),
    enabled: !!user && !isPlatformAdmin(user.role),
  });

  const zonesQuery = useQuery({
    queryKey: ["admin-zones"],
    queryFn: () => api.zones(),
    enabled: !!user,
  });

  const resQuery = useQuery({
    queryKey: ["org-reservations"],
    queryFn: () => api.allReservations(token ?? "", 1, 100),
    enabled: !!user,
  });

  const org = orgQuery.data;
  const entitlement = useMemo(
    () => (isPlatformAdmin(user?.role) ? { entitled: true, reason: null, title: "", body: "" } : orgEntitlement(org)),
    [org, user?.role],
  );
  const allZones = zonesQuery.data ?? [];
  const zones =
    org?.id != null
      ? allZones.filter((z) => z.organization_id === org.id)
      : isPlatformAdmin(user?.role)
        ? allZones
        : allZones.filter((z) => z.organization_id != null);

  const capacity = zones.reduce((s, z) => s + z.total_capacity, 0);
  const available = zones.reduce((s, z) => s + z.available_spots, 0);
  const zoneIds = useMemo(() => new Set(zones.map((z) => z.id)), [zones]);
  // Scope to this org's zones — ListAll is network-wide for admins.
  const reservations = useMemo(
    () => (resQuery.data?.items ?? []).filter((r) => zoneIds.has(r.zone_id)),
    [resQuery.data?.items, zoneIds],
  );
  const active = reservations.filter((r) => r.status === "active").length;
  const spark = bucketByHour(reservations.map((r) => r.created_at));

  return (
    <div className="shell">
      <AppHeader tag="Org" />
      <main className="shell-main shell-main--wide">
        <AdminShell
          eyebrow="Organization"
          title={org?.name ?? "Org dashboard"}
          subtitle={
            org
              ? `Status ${org.status}${org.billing_plan ? ` · ${org.billing_plan}` : ""}`
              : "Live capacity, zones, and booking pulse for your garage fleet."
          }
          nav={ORG_NAV}
        >
          {!isPlatformAdmin(user?.role) ? <EntitlementBanner state={entitlement} /> : null}
          <StatGrid
            items={[
              { label: "Zones", value: zones.length, tone: "brand" },
              { label: "Free spots", value: available, tone: "success", hint: `of ${capacity}` },
              { label: "Active bookings", value: active },
              {
                label: "Plan",
                value: org?.billing_plan ?? (isPlatformAdmin(user?.role) ? "platform" : "—"),
              },
            ]}
          />

          <div className="dash-grid-2">
            <ZoneCapacityBars
              rows={zones.map((z) => ({
                name: z.name,
                capacity: z.total_capacity,
                available: z.available_spots,
              }))}
            />
            <div className="dash-stack">
              <OccupancyRing available={available} capacity={capacity} label="Spots free" />
              <ReservationSpark series={spark} label="Booking pulse" />
            </div>
          </div>

          <div className="dash-cta-row">
            <Link href="/org/zones" className="console-btn console-btn--primary console-btn--pill">
              Manage zones
            </Link>
            <Link href="/org/members" className="console-btn console-btn--ghost console-btn--pill">
              Members
            </Link>
            <Link href="/console" className="console-btn console-btn--ghost console-btn--pill">
              Live console
            </Link>
          </div>
        </AdminShell>
      </main>
    </div>
  );
}
