"use client";

import { motion } from "framer-motion";

/** Branded route/skeleton loader used by `loading.tsx` and local fallbacks. */
export function AppPageLoader({ label = "Loading SpotSync" }: { label?: string }) {
  return (
    <div className="app-loader" role="status" aria-live="polite" aria-label={label}>
      <motion.div
        className="app-loader__mark"
        aria-hidden
        animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="app-loader__pulse" />
      </motion.div>
      <motion.p
        className="app-loader__brand"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        SpotSync
      </motion.p>
      <div className="app-loader__bar" aria-hidden>
        <motion.span
          className="app-loader__bar-fill"
          animate={{ x: ["-40%", "140%"] }}
          transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <p className="app-loader__hint">{label}</p>
    </div>
  );
}
