"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { SearchMapView } from "@/components/search/SearchMapView";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchPill } from "@/components/ui/SearchPill";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useZones, zonesOrOffline } from "@/lib/hooks/useZones";
import { useZonesStream } from "@/lib/realtime/useZonesStream";
import { getToken } from "@/lib/auth/session";
import type { Zone } from "@/lib/api/types";

function bookHref(zoneId: number, when: string) {
  const params = new URLSearchParams();
  if (when) params.set("when", when);
  const qs = params.toString();
  return `/book/${zoneId}${qs ? `?${qs}` : ""}`;
}

function ZoneCard({
  zone,
  when,
  onPreview,
}: {
  zone: Zone;
  when: string;
  onPreview: () => void;
}) {
  const full = zone.available_spots <= 0;

  return (
    <li className="zone-card">
      <div className="zone-card__media">
        <span className={`zone-card__badge${full ? " zone-card__badge--full" : ""}`}>
          {full ? "Full" : `${zone.available_spots} spots left`}
        </span>
      </div>
      <div className="zone-card__body">
        <h3 className="zone-card__name">{zone.name}</h3>
        <p className="zone-card__meta">
          {zone.type.replace("_", " ")} · {zone.total_capacity} total
        </p>
        <p className="zone-card__price">${zone.price_per_hour.toFixed(2)}/hr</p>
        <div className="zone-card__actions">
          <Button type="button" variant="ghost" onClick={onPreview}>
            Preview
          </Button>
          <Link href={`/zones/${zone.id}`} className="console-btn console-btn--ghost">
            Details
          </Link>
          <Link href={bookHref(zone.id, when)} className="console-btn console-btn--primary">
            Book
          </Link>
        </div>
      </div>
    </li>
  );
}

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q")?.trim() ?? "";
  const when = params.get("when") ?? "";
  const [view, setView] = useState<"list" | "map">("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const debouncedQ = useDebounce(q, 300);
  const zonesQuery = useZones(debouncedQ, "");
  const zonesResult = zonesOrOffline(zonesQuery.data, zonesQuery.isError && !zonesQuery.isFetching);
  const zones = zonesResult.zones;
  const token = getToken();

  useZonesStream(zonesResult.online, token);

  const title = useMemo(() => (q ? `Results for “${q}”` : "All parking zones"), [q]);

  function onSelectZone(zone: Zone) {
    setSelectedId(zone.id);
    if (view === "map") {
      router.push(bookHref(zone.id, when));
    }
  }

  const selectedZone = zones.find((z) => z.id === selectedId) ?? null;

  return (
    <>
      <SearchPill action="/search" method="get" role="search">
        <input
          type="search"
          name="q"
          className="landing-search__input"
          placeholder="City, garage, or neighborhood"
          defaultValue={q}
          aria-label="Search location"
        />
        <input
          type="datetime-local"
          name="when"
          className="landing-search__input landing-search__when"
          defaultValue={when}
          aria-label="Arrival time"
        />
        <Button type="submit" pill className="landing-search__btn">
          Search
        </Button>
      </SearchPill>

      <div className="search-toolbar">
        <h2 className="search-toolbar__title">{title}</h2>
        <div className="search-toolbar__toggle" role="tablist" aria-label="Results view">
          <button
            type="button"
            role="tab"
            aria-selected={view === "list"}
            className={view === "list" ? "console-btn console-btn--primary" : "console-btn console-btn--ghost"}
            onClick={() => setView("list")}
          >
            List
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "map"}
            className={view === "map" ? "console-btn console-btn--primary" : "console-btn console-btn--ghost"}
            onClick={() => setView("map")}
          >
            Map
          </button>
        </div>
      </div>

      {zonesQuery.isLoading ? <p>Loading zones…</p> : null}
      {zonesQuery.isError && zones.length === 0 ? (
        <p className="auth-card__error">Could not load zones. Try again shortly.</p>
      ) : null}

      {view === "map" ? (
        <SearchMapView zones={zones} selectedId={selectedId} onSelect={onSelectZone} />
      ) : (
        <ul className="zone-card-grid">
          {zones.length === 0 && !zonesQuery.isLoading ? (
            <li className="shell-card" style={{ boxShadow: "none", gridColumn: "1 / -1" }}>
              <p style={{ margin: 0 }}>No zones found.</p>
            </li>
          ) : (
            zones.map((z) => (
              <ZoneCard key={z.id} zone={z} when={when} onPreview={() => setSelectedId(z.id)} />
            ))
          )}
        </ul>
      )}

      {selectedZone ? (
        <>
          <div className="search-sheet-backdrop" onClick={() => setSelectedId(null)} aria-hidden />
          <div className="search-sheet" role="dialog" aria-label="Zone preview">
            <div className="search-sheet__handle" />
            <h3 className="search-sheet__title">{selectedZone.name}</h3>
            <p className="search-sheet__meta">
              <Badge tone={selectedZone.available_spots > 0 ? "success" : "muted"}>
                {selectedZone.available_spots}/{selectedZone.total_capacity} free
              </Badge>
              {" · "}
              <span className="font-mono">${selectedZone.price_per_hour.toFixed(2)}/hr</span>
            </p>
            <div className="zone-card__actions">
              <Link href={`/zones/${selectedZone.id}`} className="console-btn console-btn--ghost">
                Details
              </Link>
              <Link href={bookHref(selectedZone.id, when)} className="console-btn console-btn--primary">
                Book now
              </Link>
            </div>
          </div>
        </>
      ) : null}

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/driver">Map-first driver view →</Link>
      </p>
    </>
  );
}

export function SearchExperience() {
  return (
    <div className="shell">
      <AppHeader tag="Search" />
      <main className="shell-main">
        <div className="shell-card landing-search-page">
          <Suspense fallback={<p>Loading search…</p>}>
            <SearchInner />
          </Suspense>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
