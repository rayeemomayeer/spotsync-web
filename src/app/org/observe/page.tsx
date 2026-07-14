"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { AdminShell, ORG_NAV } from "@/components/dashboard/AdminShell";
import { ObserveBoard } from "@/components/dashboard/ObserveBoard";
import {
  OccupancyRing,
  ReservationSpark,
  ZoneCapacityBars,
  bucketByHour,
} from "@/components/dashboard/Charts";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api/client";
import { isPlatformAdmin } from "@/lib/auth/roles";

/** Org-scoped capacity + stack probes — no platform Grafana duplicate. */
export default function OrgObservePage() {
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
  const zones = useMemo(() => {
    const all = zonesQuery.data ?? [];
    if (org?.id != null) return all.filter((z) => z.organization_id === org.id);
    return isPlatformAdmin(user?.role) ? all : all.filter((z) => z.organization_id != null);
  }, [zonesQuery.data, org?.id, user?.role]);

  const zoneIds = useMemo(() => new Set(zones.map((z) => z.id)), [zones]);
  const reservations = useMemo(
    () => (resQuery.data?.items ?? []).filter((r) => zoneIds.has(r.zone_id)),
    [resQuery.data?.items, zoneIds],
  );
  const capacity = zones.reduce((s, z) => s + z.total_capacity, 0);
  const available = zones.reduce((s, z) => s + z.available_spots, 0);
  const spark = bucketByHour(reservations.map((r) => r.created_at));

  return (
    <div className="shell">
      <AppHeader tag="Observe" />
      <main className="shell-main shell-main--wide">
        <AdminShell
          eyebrow="Organization"
          title="Observe"
          subtitle="Your garage capacity and booking pulse — stack probes for booking health."
          nav={ORG_NAV}
        >
          <div className="dash-grid-2">
            <ZoneCapacityBars
              rows={zones.map((z) => ({
                name: z.name,
                capacity: z.total_capacity,
                available: z.available_spots,
              }))}
            />
            <div className="dash-stack">
              <OccupancyRing available={available} capacity={capacity} label="Org spots free" />
              <ReservationSpark series={spark} label="Org booking pulse" />
            </div>
          </div>
          <ObserveBoard showGrafana={false} />
        </AdminShell>
      </main>
    </div>
  );
}
