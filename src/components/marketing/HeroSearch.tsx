"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SearchPill } from "@/components/ui/SearchPill";

export function HeroSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [when, setWhen] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = location.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (when) params.set("when", when);
    router.push(`/search${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <section className="landing-hero" aria-labelledby="landing-title">
      <p className="landing-hero__eyebrow">Live capacity parking</p>
      <h1 id="landing-title" className="landing-hero__brand">
        Know before you go.
      </h1>
      <p className="landing-hero__headline">
        See open spots update in real time, pay once, and pull in with your plate on the list.
      </p>
      <p className="landing-hero__sub">
        Drivers search and book in seconds. Garage operators publish inventory after one approval — no oversell, ever.
      </p>

      <SearchPill onSubmit={onSubmit} role="search" aria-label="Find parking">
        <input
          id="landing-location"
          type="search"
          className="landing-search__input"
          placeholder="City, garage, or neighborhood"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          autoComplete="off"
          aria-label="Where to park"
        />
        <input
          type="datetime-local"
          className="landing-search__input landing-search__when"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          aria-label="Arrival time"
        />
        <Button type="submit" pill className="landing-search__btn">
          Search
        </Button>
      </SearchPill>

      <div className="landing-hero__cta">
        <Link href="/signup" className="console-btn console-btn--primary console-btn--pill">
          Get started
        </Link>
        <Link href="/driver" className="console-btn console-btn--ghost console-btn--pill landing-hero__cta-ghost">
          Driver map
        </Link>
      </div>
    </section>
  );
}
