import type { Spot } from "@/lib/api/types";

export type PathPoint = { x: number; y: number };

/** Road entry → aisle → stall approach for GSAP timeline */
export function pathForSpot(spot: Spot): PathPoint[] {
  const roadY = 308;
  const entryX = 20;
  const entryY = roadY;
  const mergeX = spot.pos_x - 50;
  const mergeY = roadY;
  const aisleY = spot.pos_y + 24;

  return [
    { x: entryX, y: entryY },
    { x: mergeX, y: mergeY },
    { x: mergeX, y: aisleY },
    { x: spot.pos_x + 12, y: aisleY },
    { x: spot.pos_x + 20, y: spot.pos_y + 32 },
  ];
}

export const GHOST_COLORS = ["#4A90D9", "#E74C3C", "#2ECC71", "#F1C40F", "#9B59B6", "#1ABC9C"];

export function randomGhostColor() {
  return GHOST_COLORS[Math.floor(Math.random() * GHOST_COLORS.length)];
}
