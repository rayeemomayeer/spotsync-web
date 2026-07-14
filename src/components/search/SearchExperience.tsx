"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { SearchMapView } from "@/components/search/SearchMapView";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
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
      <form className="landing-search landing-search--inline" action="/search" method="get" role="search">
        <div className="landing-search__row">
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
          <button type="submit" className="console-btn console-btn--primary landing-search__btn">
            Search
          </button>
        </div>
      </form>

      <div className="search-toolbar">
        <h2 style={{ margin: 0, fontSize: "1.15rem" }}>{title}</h2>
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
        <ul className="console-zone-list">
          {zones.length === 0 && !zonesQuery.isLoading ? (
            <li className="shell-card" style={{ boxShadow: "none" }}>
              <p style={{ margin: 0 }}>No zones found.</p>
            </li>
          ) : (
            zones.map((z) => (
              <li key={z.id} className="shell-card" style={{ boxShadow: "none" }}>
                <strong>{z.name}</strong>
                <p style={{ margin: "0.35rem 0" }}>
                  {z.available_spots}/{z.total_capacity} free · ${z.price_per_hour.toFixed(2)}/hr · {z.type}
                </p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="console-btn console-btn--ghost"
                    onClick={() => setSelectedId(z.id)}
                  >
                    Preview
                  </button>
                  <Link href={`/zones/${z.id}`} className="console-btn console-btn--ghost">
                    Details
                  </Link>
                  <Link href={bookHref(z.id, when)} className="console-btn console-btn--primary">
                    Book
                  </Link>
                </div>
              </li>
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
              {selectedZone.available_spots}/{selectedZone.total_capacity} free · $
              {selectedZone.price_per_hour.toFixed(2)}/hr
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
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

      <p>
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
