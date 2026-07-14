"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function HeroSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = location.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.push(`/search${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <section className="landing-hero" aria-labelledby="landing-title">
      <p className="landing-hero__eyebrow">Parking marketplace</p>
      <h1 id="landing-title" className="landing-hero__brand">
        SpotSync
      </h1>
      <p className="landing-hero__headline">Park like you ride — book a spot before you arrive.</p>
      <p className="landing-hero__sub">
        Live availability for drivers. Subscription tools for garage operators. One platform, zero guesswork.
      </p>

      <form className="landing-search" onSubmit={onSubmit} role="search" aria-label="Find parking">
        <label className="landing-search__label" htmlFor="landing-location">
          Where to?
        </label>
        <div className="landing-search__row">
          <input
            id="landing-location"
            type="search"
            className="landing-search__input"
            placeholder="City, garage, or neighborhood"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="console-btn console-btn--primary landing-search__btn">
            Find parking
          </button>
        </div>
      </form>

      <div className="landing-hero__cta">
        <Link href="/signup" className="console-btn console-btn--primary">
          Get started
        </Link>
        <Link
          href="/login"
          className="console-btn console-btn--ghost landing-hero__cta-ghost"
        >
          Sign in
        </Link>
        <Link href="/driver" className="console-btn console-btn--ghost landing-hero__cta-ghost">
          Driver map
        </Link>
      </div>
    </section>
  );
}
