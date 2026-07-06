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
          duration: i === 0 ? 0.6 : 0.5,
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
      <circle cx={12} cy={12} r={14} fill="#7EC8E3" opacity={0.25} />
      <rect x={4} y={6} width={16} height={10} rx={2} fill={ghost.color} />
      <rect x={6} y={2} width={12} height={6} rx={2} fill={ghost.color} opacity={0.85} />
    </g>
  );
}
