"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { api } from "@/lib/api/client";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q")?.trim() ?? "";

  const { data: zones = [], isLoading, isError } = useQuery({
    queryKey: ["search-zones", q],
    queryFn: () => api.zones(q ? { q } : undefined),
  });

  const title = useMemo(() => (q ? `Results for “${q}”` : "All parking zones"), [q]);

  return (
  <>
      <h1>{title}</h1>
      <p className="landing-search-page__hint">
        {q ? (
          <>
            Showing zones matching your search.{" "}
            <Link href="/driver">Open map view →</Link>
          </>
        ) : (
          <>Browse available zones or refine with a location above.</>
        )}
      </p>

      {isLoading ? <p>Loading zones…</p> : null}
      {isError ? <p className="auth-card__error">Could not load zones. Try again shortly.</p> : null}

      <ul className="console-zone-list">
        {zones.length === 0 && !isLoading ? (
          <li className="shell-card" style={{ boxShadow: "none" }}>
            <p style={{ margin: 0 }}>No zones found. Try a different search or check back later.</p>
          </li>
        ) : (
          zones.map((z) => (
            <li key={z.id} className="shell-card" style={{ boxShadow: "none" }}>
              <strong>{z.name}</strong>
              <p style={{ margin: "0.35rem 0" }}>
                {z.available_spots}/{z.total_capacity} free · ${z.price_per_hour.toFixed(2)}/hr · {z.type}
              </p>
              <Link href={`/book/${z.id}`} className="console-btn console-btn--primary">
                Book
              </Link>
            </li>
          ))
        )}
      </ul>
    </>
  );
}

function SearchForm() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";

  return (
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
        <button type="submit" className="console-btn console-btn--primary landing-search__btn">
          Search
        </button>
      </div>
    </form>
  );
}

export default function SearchPage() {
  return (
    <div className="shell">
      <AppHeader tag="Search" />
      <main className="shell-main">
        <div className="shell-card landing-search-page">
          <Suspense fallback={<p>Loading search…</p>}>
            <SearchForm />
          </Suspense>
          <Suspense fallback={<p>Loading results…</p>}>
            <SearchResults />
          </Suspense>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
