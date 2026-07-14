"use client";

import Link from "next/link";
import { useZones, zonesOrOffline } from "@/lib/hooks/useZones";

export function LiveMarketplace() {
  const zonesQuery = useZones("", "");
  const { zones, online } = zonesOrOffline(
    zonesQuery.data,
    zonesQuery.isError && !zonesQuery.isFetching,
  );

  const capacity = zones.reduce((n, z) => n + z.total_capacity, 0);
  const free = zones.reduce((n, z) => n + z.available_spots, 0);
  const top = [...zones].sort((a, b) => b.available_spots - a.available_spots).slice(0, 4);

  return (
    <section className="live-market" aria-labelledby="live-market-heading">
      <div className="live-market__intro">
        <p className="live-market__eyebrow">
          <span className={`live-market__pulse${online ? " live-market__pulse--on" : ""}`} />
          {online ? "Live zones" : zonesQuery.isLoading ? "Connecting…" : "Offline preview"}
        </p>
        <h2 id="live-market-heading" className="live-market__title">
          Marketplace capacity right now
        </h2>
        <p className="live-market__lede">
          Pulled from <code>GET /api/v1/zones</code> — same inventory drivers search and book.
        </p>
      </div>

      <dl className="live-market__kpis">
        <div>
          <dt>Zones</dt>
          <dd className="font-mono">{zones.length}</dd>
        </div>
        <div>
          <dt>Free spots</dt>
          <dd className="font-mono">{free}</dd>
        </div>
        <div>
          <dt>Total stalls</dt>
          <dd className="font-mono">{capacity}</dd>
        </div>
        <div>
          <dt>Fill</dt>
          <dd className="font-mono">
            {capacity > 0 ? `${Math.round(((capacity - free) / capacity) * 100)}%` : "—"}
          </dd>
        </div>
      </dl>

      <ul className="live-market__list">
        {top.length === 0 && !zonesQuery.isLoading ? (
          <li className="live-market__empty">No zones returned from API yet.</li>
        ) : (
          top.map((z) => (
            <li key={z.id}>
              <Link href={`/zones/${z.id}`} className="live-market__row">
                <span className="live-market__name">{z.name}</span>
                <span className="live-market__meta">
                  <span className="font-mono">
                    {z.available_spots}/{z.total_capacity}
                  </span>
                  {" · "}
                  <span className="font-mono">${z.price_per_hour.toFixed(2)}/hr</span>
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>

      <p className="live-market__cta">
        <Link href="/search">Browse all zones →</Link>
      </p>
    </section>
  );
}
