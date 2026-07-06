"use client";

import { useEffect, useState } from "react";
import type { Spot } from "@/lib/api/types";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const GHOST_GRID = process.env.NEXT_PUBLIC_DEMO_GHOST_GRID === "true";

export function useGhostGrid(spots: Spot[], enabled = true): Set<number> {
  const [ghostIds, setGhostIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled || !DEMO_MODE || !GHOST_GRID || spots.length === 0) {
      return;
    }

    const tick = () => {
      const available = spots.filter((s) => s.status === "available" && !s.occupied);
      if (available.length === 0) return;

      const pick = available[Math.floor(Math.random() * available.length)];
      setGhostIds((prev) => new Set(prev).add(pick.id));

      setTimeout(() => {
        setGhostIds((prev) => {
          const next = new Set(prev);
          next.delete(pick.id);
          return next;
        });
      }, 2800);
    };

    tick();
    const interval = setInterval(tick, 10000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, [spots, enabled]);

  return ghostIds;
}
