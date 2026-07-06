"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Spot } from "@/lib/api/types";
import { groupSpotsByBlock, type SpotBlock } from "@/lib/spots/grouping";

export type SpotCellState = "available" | "occupied" | "unavailable" | "ghost" | "owned";

function cellState(spot: Spot, ghostIds: Set<number>, ownedIds: Set<number>): SpotCellState {
  if (ownedIds.has(spot.id)) return "owned";
  if (ghostIds.has(spot.id)) return "ghost";
  if (spot.status === "unavailable") return "unavailable";
  if (spot.occupied) return "occupied";
  return "available";
}

export function SpotGrid({
  spots,
  selectedId,
  shakeSpotId,
  ghostIds,
  ownedIds,
  stress,
  showGhostLegend,
  onSelect,
}: {
  spots: Spot[];
  selectedId?: number;
  shakeSpotId?: number | null;
  ghostIds: Set<number>;
  ownedIds: Set<number>;
  stress?: boolean;
  showGhostLegend?: boolean;
  onSelect: (spot: Spot) => void;
}) {
  const blocks = groupSpotsByBlock(spots);
  const flatSpots = blocks.flatMap((b) => b.spots);
  const gridRef = useRef<HTMLDivElement>(null);
  const flatSpotsRef = useRef(flatSpots);
  const selectedIdRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    flatSpotsRef.current = flatSpots;
    selectedIdRef.current = selectedId;
    onSelectRef.current = onSelect;
  }, [flatSpots, selectedId, onSelect]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const list = flatSpotsRef.current;
      if (list.length === 0) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const idx = list.findIndex((s) => s.id === selectedIdRef.current);
        const next = list[(idx + 1 + list.length) % list.length];
        onSelectRef.current(next);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const idx = list.findIndex((s) => s.id === selectedIdRef.current);
        const next = list[(idx - 1 + list.length) % list.length];
        onSelectRef.current(next);
      }
    };

    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      ref={gridRef}
      className={`console-spot-grid ${stress ? "console-spot-grid--stress" : ""}`}
      tabIndex={0}
      role="grid"
      aria-label="Parking spots"
    >
      {blocks.map((block) => (
        <SpotBlockGrid
          key={block.id}
          block={block}
          selectedId={selectedId}
          shakeSpotId={shakeSpotId}
          ghostIds={ghostIds}
          ownedIds={ownedIds}
          onSelect={onSelect}
        />
      ))}
      {showGhostLegend && ghostIds.size > 0 && (
        <p className="console-ghost-hint">Simulated occupancy pulses on random cells (demo only)</p>
      )}
    </div>
  );
}

function SpotBlockGrid({
  block,
  selectedId,
  shakeSpotId,
  ghostIds,
  ownedIds,
  onSelect,
}: {
  block: SpotBlock;
  selectedId?: number;
  shakeSpotId?: number | null;
  ghostIds: Set<number>;
  ownedIds: Set<number>;
  onSelect: (spot: Spot) => void;
}) {
  const colCount = Math.min(6, Math.max(block.spots.length, 1));

  return (
    <section className="console-spot-block" role="rowgroup">
      <h3 className="console-spot-block__title">{block.name}</h3>
      <div
        className="console-spot-block__cells"
        style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
        role="row"
      >
        {block.spots.map((spot) => {
          const state = cellState(spot, ghostIds, ownedIds);
          const selected = spot.id === selectedId;
          const shaking = spot.id === shakeSpotId;
          const disabled = state === "unavailable" || state === "occupied" || state === "ghost";
          const canInteract = state === "available" || state === "owned" || selected;

          return (
            <motion.button
              key={spot.id}
              type="button"
              role="gridcell"
              layout
              title={`${spot.label} — ${state === "owned" ? "your booking" : state}`}
              aria-label={spot.label}
              aria-selected={selected}
              disabled={disabled && !selected}
              onClick={() => onSelect(spot)}
              className={`console-spot-cell console-spot-cell--${state} ${selected ? "console-spot-cell--selected" : ""}`}
              animate={shaking ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.45 }}
              whileHover={canInteract ? { scale: 1.04 } : undefined}
              whileTap={canInteract ? { scale: 0.97 } : undefined}
            >
              {selected && (
                <motion.span
                  layoutId="spot-selection-ring"
                  className="console-spot-cell__ring"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}
              <span className="console-spot-cell__label">{spot.label}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

export function AvailabilityMeter({
  free,
  total,
  stress,
}: {
  free: number;
  total: number;
  stress?: boolean;
}) {
  const pct = total > 0 ? (free / total) * 100 : 0;

  return (
    <div className={`console-availability ${stress ? "console-availability--stress" : ""}`}>
      <div className="console-availability__numbers">
        <motion.span
          key={free}
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="console-availability__free"
        >
          {free}
        </motion.span>
        <span className="console-availability__total">/ {total} free</span>
      </div>
      <div className="console-availability__bar" aria-hidden>
        <motion.div
          className="console-availability__fill"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
        />
      </div>
    </div>
  );
}
