"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { SpotGrid } from "@/components/console/SpotGrid";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api/client";
import { useZoneSpots } from "@/lib/hooks/useZoneSpots";
import { useZonesStream } from "@/lib/realtime/useZonesStream";
import { getToken } from "@/lib/auth/session";
import { useQuery } from "@tanstack/react-query";

export default function ZoneDetailPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const zoneId = Number(params.id);
  const when = search.get("when") ?? "";
  const { user } = useAuth();
  const token = getToken();

  const zoneQuery = useQuery({
    queryKey: ["zone", zoneId],
    queryFn: () => api.zone(zoneId),
    enabled: Number.isFinite(zoneId) && zoneId > 0,
  });

  const zone = zoneQuery.data ?? null;
  useZonesStream(true, token);
  const { displaySpots } = useZoneSpots(zone ?? undefined, true);

  const bookQs = new URLSearchParams();
  if (when) bookQs.set("when", when);

  return (
    <div className="shell">
      <AppHeader tag="Zone" />
      <main className="shell-main page-surface">
        {zoneQuery.isLoading ? (
          <p>Loading zone…</p>
        ) : !zone ? (
          <p>Zone not found.</p>
        ) : (
          <>
            <div className="zone-detail-hero">
              <div className="zone-detail-hero__media" aria-hidden />
              <div className="zone-detail-hero__body">
                <h1>{zone.name}</h1>
                <p>
                  <Badge tone={zone.available_spots > 0 ? "success" : "muted"}>
                    {zone.available_spots}/{zone.total_capacity} free
                  </Badge>
                  {" · "}
                  <span className="font-mono">${zone.price_per_hour.toFixed(2)}/hr</span>
                  {" · "}
                  {zone.type.replace("_", " ")}
                </p>
              </div>
            </div>
            <SpotGrid
              spots={displaySpots}
              ghostIds={new Set()}
              ownedIds={new Set()}
              onSelect={(spot) => {
                const qs = new URLSearchParams(bookQs);
                qs.set("spot", String(spot.id));
                window.location.href = `/book/${zone.id}?${qs.toString()}`;
              }}
            />
            <p>
              {user ? (
                <Link
                  href={`/book/${zone.id}?${bookQs.toString()}`}
                  className="console-btn console-btn--primary console-btn--pill"
                >
                  Continue to checkout
                </Link>
              ) : (
                <>
                  <Link href={`/login?next=/zones/${zone.id}`}>Sign in</Link> to book
                </>
              )}
            </p>
            <p>
              <Link href="/search">← Search</Link>
            </p>
          </>
        )}
      </main>
    </div>
  );
}
