import type { Spot } from "@/lib/api/types";

export type PathPoint = { x: number; y: number };

/** Road entry → aisle → stall approach for GSAP timeline */
export function pathForSpot(spot: Spot): PathPoint[] {
  const entryX = 40;
  const entryY = spot.pos_y + 20;
  const aisleX = spot.pos_x - 30;
  const aisleY = spot.pos_y + 20;
  const approachX = spot.pos_x + 10;
  const approachY = spot.pos_y + 35;

  return [
    { x: entryX, y: entryY },
    { x: aisleX, y: entryY },
    { x: aisleX, y: aisleY },
    { x: approachX, y: approachY },
    { x: spot.pos_x + 18, y: spot.pos_y + 28 },
  ];
}

export const GHOST_COLORS = ["#4A90D9", "#E74C3C", "#2ECC71", "#F1C40F", "#9B59B6", "#1ABC9C"];

export function randomGhostColor() {
  return GHOST_COLORS[Math.floor(Math.random() * GHOST_COLORS.length)];
}
