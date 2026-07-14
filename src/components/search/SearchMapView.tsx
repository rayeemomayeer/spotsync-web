"use client";

import Link from "next/link";
import type { Zone } from "@/lib/api/types";
import { zoneMapPosition, zonePinLabel } from "@/lib/map/zone-positions";

export function SearchMapView({
  zones,
  selectedId,
  onSelect,
}: {
  zones: Zone[];
  selectedId: number | null;
  onSelect: (zone: Zone) => void;
}) {
  return (
    <div className="search-map" role="img" aria-label="Zone map preview">
      <div className="search-map__canvas">
        {zones.map((zone) => {
          const { x, y } = zoneMapPosition(zone);
          const active = selectedId === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              className={`search-map__pin${active ? " search-map__pin--active" : ""}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              title={zone.name}
              onClick={() => onSelect(zone)}
            >
              <span className="search-map__pin-label">{zonePinLabel(zone)}</span>
            </button>
          );
        })}
      </div>
      {selectedId != null ? (
        <p className="search-map__hint">
          Selected zone #{selectedId}.{" "}
          <Link href={`/zones/${selectedId}`}>View details →</Link>
        </p>
      ) : (
        <p className="search-map__hint">Tap a pin to preview a zone.</p>
      )}
    </div>
  );
}
