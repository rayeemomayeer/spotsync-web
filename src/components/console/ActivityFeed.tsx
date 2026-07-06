"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ZoneEventType } from "@/lib/realtime/events";

export type FeedEntry = {
  id: string;
  type: ZoneEventType;
  spotLabel: string;
  plate?: string;
  at: Date;
  local?: boolean;
};

const feedVerb: Record<ZoneEventType, string> = {
  spot_reserved: "reserved",
  spot_released: "released",
  spot_expired: "expired",
};

export function ActivityFeed({ entries }: { entries: FeedEntry[] }) {
  return (
    <section className="console-activity" aria-live="polite" aria-relevant="additions">
      <h2 className="console-panel-title">Live activity</h2>
      <ul className="console-activity__list">
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <motion.li
              key={entry.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={`console-activity__item console-activity__item--${entry.type}`}
            >
              <span className="console-activity__dot" />
              <span className="console-activity__text">
                <strong>{entry.spotLabel}</strong> {feedVerb[entry.type]}
                {entry.plate ? ` · ${entry.plate}` : ""}
                {entry.local ? " (you)" : ""}
              </span>
              <time className="console-activity__time">{formatTime(entry.at)}</time>
            </motion.li>
          ))}
        </AnimatePresence>
        {entries.length === 0 && (
          <li className="console-empty">Waiting for spot events…</li>
        )}
      </ul>
    </section>
  );
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
