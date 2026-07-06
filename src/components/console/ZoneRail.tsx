"use client";

import type { Zone } from "@/lib/api/types";

const ZONE_TYPES = [
  { value: "", label: "All types" },
  { value: "ev_charging", label: "EV charging" },
  { value: "covered", label: "Covered" },
  { value: "general", label: "General" },
] as const;

export function ZoneRail({
  zones,
  selectedId,
  search,
  typeFilter,
  onSearchChange,
  onTypeChange,
  onSelect,
}: {
  zones: Zone[];
  selectedId?: number;
  search: string;
  typeFilter: string;
  onSearchChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onSelect: (zone: Zone) => void;
}) {
  return (
    <aside className="console-zone-rail">
      <h2 className="console-zone-rail__title">Zones</h2>

      <input
        type="search"
        placeholder="Search zones…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="console-input"
        aria-label="Search zones"
      />

      <select
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value)}
        className="console-input console-input--select"
        aria-label="Filter by zone type"
      >
        {ZONE_TYPES.map((t) => (
          <option key={t.value || "all"} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <ul className="console-zone-list">
        {zones.map((zone) => {
          const active = zone.id === selectedId;
          const low = zone.available_spots <= 1 && zone.available_spots > 0;
          return (
            <li key={zone.id}>
              <button
                type="button"
                className={`console-zone-card ${active ? "console-zone-card--active" : ""} ${low ? "console-zone-card--stress" : ""}`}
                onClick={() => onSelect(zone)}
              >
                <span className="console-zone-card__dot" />
                <span className="console-zone-card__body">
                  <span className="console-zone-card__name">{zone.name}</span>
                  <span className="console-zone-card__meta">
                    {zone.type.replace("_", " ")} · ${zone.price_per_hour}/hr
                  </span>
                </span>
                <span className="console-zone-card__free">{zone.available_spots} free</span>
              </button>
            </li>
          );
        })}
        {zones.length === 0 && <p className="console-empty">No zones match</p>}
      </ul>
    </aside>
  );
}
