"use client";

import { useEffect, useRef, useState } from "react";
import { select } from "d3-selection";
import { zoom, zoomIdentity, zoomTransform, type ZoomBehavior } from "d3-zoom";
import { RoadPaths } from "./RoadPaths";
import { SpotTile } from "./SpotTile";
import { GhostCarSprite } from "./GhostCar";
import type { Spot } from "@/lib/api/types";
import type { GhostCar } from "@/lib/simulation/engine";

type Props = {
  spots: Spot[];
  ghostSpotIds: Set<number>;
  ghosts: GhostCar[];
  selectedSpot: Spot | null;
  shakeSpotId: number | null;
  onSelectSpot: (spot: Spot) => void;
};

export function MapCanvas({
  spots,
  ghostSpotIds,
  ghosts,
  selectedSpot,
  shakeSpotId,
  onSelectSpot,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = select(svgRef.current);
    const g = select(gRef.current);
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.6, 2.5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
        setZoomLevel(event.transform.k);
      });
    svg.call(behavior as ZoomBehavior<SVGSVGElement, unknown>);
    svg.call(behavior.transform, zoomIdentity.translate(0, 0).scale(1));
    return () => {
      svg.on(".zoom", null);
    };
  }, []);

  const zoomBy = (factor: number) => {
    if (!svgRef.current || !gRef.current) return;
    const svg = select(svgRef.current);
    const g = select(gRef.current);
    const current = zoomTransform(svgRef.current);
    const next = current.scale(Math.min(2.5, Math.max(0.6, current.k * factor)));
    svg.call(
      zoom<SVGSVGElement, unknown>().transform as unknown as (
        s: typeof svg,
        t: typeof next,
      ) => void,
      next,
    );
    g.attr("transform", next.toString());
    setZoomLevel(next.k);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#C9B896]">
      <svg ref={svgRef} viewBox="0 0 900 560" className="h-full w-full touch-none">
        <g ref={gRef}>
          <RoadPaths />
          {spots.map((spot) => (
            <SpotTile
              key={spot.id}
              spot={spot}
              selected={selectedSpot?.id === spot.id}
              shake={shakeSpotId === spot.id}
              ghostOccupied={ghostSpotIds.has(spot.id)}
              onSelect={onSelectSpot}
            />
          ))}
          {ghosts.map((ghost) => (
            <GhostCarSprite key={ghost.id} ghost={ghost} />
          ))}
        </g>
      </svg>
      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-2">
        <button
          type="button"
          onClick={() => zoomBy(1.2)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-md"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.2)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-md"
          aria-label="Zoom out"
        >
          −
        </button>
      </div>
      <span className="sr-only">Zoom level {Math.round(zoomLevel * 100)}%</span>
    </div>
  );
}
