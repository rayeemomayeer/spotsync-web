"use client";

import { useEffect, useRef, useState } from "react";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { LotScene } from "./LotScene";
import { SpotTile } from "./SpotTile";
import { GhostCarSprite } from "./GhostCar";
import type { Spot } from "@/lib/api/types";
import type { GhostCar } from "@/lib/simulation/engine";

type Props = {
  spots: Spot[];
  ghostSpotIds: Set<number>;
  ghosts: GhostCar[];
  selectedSpot: Spot | null;
  hoveredSpot: Spot | null;
  shakeSpotId: number | null;
  stressHighlight: boolean;
  onSelectSpot: (spot: Spot) => void;
  onHoverSpot: (spot: Spot | null) => void;
};

export function MapCanvas({
  spots,
  ghostSpotIds,
  ghosts,
  selectedSpot,
  hoveredSpot,
  shakeSpotId,
  stressHighlight,
  onSelectSpot,
  onHoverSpot,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = select(svgRef.current);
    const g = select(gRef.current);
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.75, 2.2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
        setZoomLevel(event.transform.k);
      });
    svg.call(behavior as ZoomBehavior<SVGSVGElement, unknown>);
    svg.call(behavior.transform, zoomIdentity.translate(-40, -20).scale(0.95));
    return () => {
      svg.on(".zoom", null);
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#D4C4A8]">
      <svg ref={svgRef} viewBox="0 0 1100 640" className="h-full w-full touch-none" preserveAspectRatio="xMidYMid slice">
        <g ref={gRef}>
          <LotScene />
          {spots.map((spot) => (
            <SpotTile
              key={spot.id}
              spot={spot}
              selected={selectedSpot?.id === spot.id}
              hovered={hoveredSpot?.id === spot.id}
              shake={shakeSpotId === spot.id}
              stressHighlight={stressHighlight}
              ghostOccupied={ghostSpotIds.has(spot.id)}
              onSelect={onSelectSpot}
              onHover={onHoverSpot}
            />
          ))}
          {ghosts.map((ghost) => (
            <GhostCarSprite key={ghost.id} ghost={ghost} />
          ))}
        </g>
      </svg>
    </div>
  );
}
