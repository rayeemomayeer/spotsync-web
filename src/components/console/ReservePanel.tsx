"use client";

import { motion } from "framer-motion";
import type { Spot } from "@/lib/api/types";

export function ReservePanel({
  spot,
  plate,
  owned,
  onPlateChange,
  onReserve,
  loading,
  error,
  demoMode,
}: {
  spot: Spot | null;
  plate: string;
  owned?: boolean;
  onPlateChange: (v: string) => void;
  onReserve: () => void;
  loading?: boolean;
  error?: string;
  demoMode?: boolean;
}) {
  return (
    <section className="console-reserve">
      <h2 className="console-panel-title">Reserve</h2>
      {spot ? (
        <>
          <p className="console-reserve__spot">{spot.label}</p>
          {owned ? (
            <p className="console-reserve__owned">You booked this spot</p>
          ) : (
            <>
              <label className="console-label" htmlFor="plate-input">
                License plate
              </label>
              <input
                id="plate-input"
                type="text"
                value={plate}
                onChange={(e) => onPlateChange(e.target.value.toUpperCase())}
                className="console-input"
                placeholder="ABC-1234"
                maxLength={15}
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="console-reserve__error"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}
              <button
                type="button"
                className="console-btn console-btn--primary console-btn--full"
                disabled={loading || !plate.trim() || spot.status === "unavailable" || spot.occupied}
                onClick={onReserve}
              >
                {loading ? "Reserving…" : demoMode ? "Demo reserve" : "Reserve spot"}
              </button>
              {demoMode && <p className="console-reserve__hint">Demo bookings auto-release in 10 min</p>}
            </>
          )}
        </>
      ) : (
        <p className="console-empty">Select an available spot on the grid</p>
      )}
    </section>
  );
}
