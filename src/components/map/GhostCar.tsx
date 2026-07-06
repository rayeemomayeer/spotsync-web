"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { GhostCar } from "@/lib/simulation/engine";

export function GhostCarSprite({ ghost }: { ghost: GhostCar }) {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || ghost.path.length < 2) return;

    const tl = gsap.timeline();
    ghost.path.forEach((pt, i) => {
      tl.to(
        el,
        {
          attr: { transform: `translate(${pt.x}, ${pt.y})` },
          duration: i === 0 ? 0.7 : 0.55,
          ease: i === ghost.path.length - 1 ? "power2.out" : "power2.inOut",
        },
        i === 0 ? 0 : "-=0.1",
      );
    });

    return () => {
      tl.kill();
    };
  }, [ghost]);

  return (
    <g ref={ref} transform={`translate(${ghost.path[0].x}, ${ghost.path[0].y})`}>
      <circle cx={16} cy={14} r={20} fill="#7EC8E3" opacity={0.2} />
      <rect x={4} y={12} width={24} height={12} rx={3} fill={ghost.color} stroke="#333" strokeWidth={0.5} />
      <rect x={7} y={6} width={18} height={9} rx={2} fill={ghost.color} stroke="#333" strokeWidth={0.5} opacity={0.9} />
    </g>
  );
}
