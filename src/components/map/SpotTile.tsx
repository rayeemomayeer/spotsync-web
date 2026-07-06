"use client";

import { motion } from "framer-motion";
import type { Spot } from "@/lib/api/types";

type Props = {
  spot: Spot;
  selected: boolean;
  shake: boolean;
  ghostOccupied: boolean;
  onSelect: (spot: Spot) => void;
};

export function SpotTile({ spot, selected, shake, ghostOccupied, onSelect }: Props) {
  const occupied = spot.occupied || ghostOccupied;
  const available = spot.status === "available" && !occupied;

  const fill = occupied ? "#B8B5AD" : available ? "transparent" : "#E0DDD6";
  const stroke = selected ? "#7EC8E3" : available ? "#FFFFFF" : "#999";

  return (
    <motion.g
      animate={shake ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      style={{ cursor: available ? "pointer" : "default" }}
      onClick={() => available && onSelect(spot)}
      role="button"
      tabIndex={available ? 0 : -1}
      aria-label={`${spot.label} ${occupied ? "occupied" : available ? "available" : "unavailable"}`}
    >
      <rect
        x={spot.pos_x}
        y={spot.pos_y}
        width={36}
        height={56}
        rx={4}
        fill={fill}
        stroke={stroke}
        strokeWidth={selected ? 2.5 : 1.5}
        transform={`rotate(-35 ${spot.pos_x + 18} ${spot.pos_y + 28})`}
      />
      {selected && (
        <motion.circle
          cx={spot.pos_x + 18}
          cy={spot.pos_y + 28}
          r={28}
          fill="none"
          stroke="#7EC8E3"
          strokeWidth={2}
          initial={{ scale: 0.9, opacity: 0.8 }}
          animate={{ scale: 1.04, opacity: 0.35 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      )}
      {occupied && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          transform={`translate(${spot.pos_x + 6}, ${spot.pos_y + 14}) rotate(-35 ${spot.pos_x + 18} ${spot.pos_y + 28})`}
        >
          <rect x={0} y={0} width={24} height={14} rx={3} fill={ghostOccupied && !spot.occupied ? "#7EC8E3" : "#6B7280"} opacity={0.85} />
          <rect x={4} y={-4} width={16} height={8} rx={2} fill={ghostOccupied && !spot.occupied ? "#5BA8C9" : "#4B5563"} />
        </motion.g>
      )}
      <text
        x={spot.pos_x + 18}
        y={spot.pos_y + 62}
        textAnchor="middle"
        fontSize={9}
        fill="#555"
        transform={`rotate(-35 ${spot.pos_x + 18} ${spot.pos_y + 28})`}
      >
        {spot.label}
      </text>
    </motion.g>
  );
}
