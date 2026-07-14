"use client";

import { motion } from "framer-motion";

export type StatItem = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "brand" | "success" | "warn";
};

export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <ul className="dash-stat-grid">
      {items.map((item, i) => (
        <motion.li
          key={item.label}
          className={`dash-stat dash-stat--${item.tone ?? "default"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
        >
          <span className="dash-stat__value">{item.value}</span>
          <span className="dash-stat__label">{item.label}</span>
          {item.hint ? <span className="dash-stat__hint">{item.hint}</span> : null}
        </motion.li>
      ))}
    </ul>
  );
}
