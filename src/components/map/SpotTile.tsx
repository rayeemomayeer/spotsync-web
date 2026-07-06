"use client";

import { motion } from "framer-motion";
import type { Spot } from "@/lib/api/types";
import { ParkedCar, carColorForSpot } from "./ParkedCar";

type Props = {
  spot: Spot;
  selected: boolean;
  hovered: boolean;
  shake: boolean;
  ghostOccupied: boolean;
  stressHighlight: boolean;
  onSelect: (spot: Spot) => void;
  onHover: (spot: Spot | null) => void;
};

export function SpotTile({
  spot,
  selected,
  hovered,
  shake,
  ghostOccupied,
  stressHighlight,
  onSelect,
  onHover,
}: Props) {
  const occupied = spot.occupied || ghostOccupied;
  const available = spot.status === "available" && !occupied;
  const w = 40;
  const h = 64;
  const cx = spot.pos_x + w / 2;
  const cy = spot.pos_y + h / 2;

  return (
    <motion.g
      animate={shake ? { x: [0, -4, 4, -4, 4, 0] } : stressHighlight && available ? { scale: [1, 1.03, 1] } : { x: 0, scale: 1 }}
      transition={{ duration: shake ? 0.4 : 1.2, repeat: stressHighlight && available ? Infinity : 0 }}
      style={{ cursor: available ? "pointer" : "default" }}
      onClick={() => available && onSelect(spot)}
      onMouseEnter={() => onHover(spot)}
      onMouseLeave={() => onHover(null)}
      role="button"
      tabIndex={available ? 0 : -1}
      aria-label={`${spot.label} ${occupied ? "occupied" : available ? "available" : "unavailable"}`}
    >
      {/* Stall pavement */}
      <rect
        x={spot.pos_x}
        y={spot.pos_y}
        width={w}
        height={h}
        rx={3}
        fill={occupied ? "#B8B5AD" : available ? "#D9D2C4" : "#E0DDD6"}
        stroke={selected ? "#7EC8E3" : hovered && available ? "#7EC8E3" : "#FFFFFF"}
        strokeWidth={selected ? 2.5 : hovered ? 2 : 1.5}
        transform={`rotate(-35 ${cx} ${cy})`}
        opacity={available ? 1 : 0.85}
      />
      {/* Diagonal stall lines */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={spot.pos_x + w * t}
          y1={spot.pos_y + 4}
          x2={spot.pos_x + w * t}
          y2={spot.pos_y + h - 4}
          stroke="#FFFFFF"
          strokeWidth={1}
          opacity={0.55}
          transform={`rotate(-35 ${cx} ${cy})`}
        />
      ))}
      {selected && available && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={34}
          fill="none"
          stroke="#7EC8E3"
          strokeWidth={2}
          initial={{ scale: 0.92, opacity: 0.7 }}
          animate={{ scale: 1.06, opacity: 0.35 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        />
      )}
      {occupied && (
        <ParkedCar
          x={spot.pos_x}
          y={spot.pos_y}
          color={carColorForSpot(spot.id, ghostOccupied && !spot.occupied)}
          selected={selected}
        />
      )}
    </motion.g>
  );
}
