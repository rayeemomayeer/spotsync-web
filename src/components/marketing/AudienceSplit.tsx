"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const drivers = [
  "Map-first booking with a live spot grid",
  "SSE capacity that updates while you decide",
  "Receipts and refunds in one account",
];

const operators = [
  "Self-apply → platform approval",
  "Stripe subscription unlocks zone publish",
  "Row-level capacity locks — never oversell",
];

export function AudienceSplit() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="audience-split" ref={ref} aria-labelledby="audience-heading">
      <div className="audience-split__head">
        <p className="audience-split__eyebrow">Two sides</p>
        <h2 id="audience-heading" className="audience-split__title">
          Built for the road and the ramp
        </h2>
      </div>

      <div className="audience-split__panels">
        <div className="audience-split__panel audience-split__panel--driver">
          <h3>Drivers</h3>
          <p className="audience-split__lede">Know before you leave. Pay once. Pull in.</p>
          <ul>
            {drivers.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.45 }}
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="audience-split__rail" aria-hidden>
          <span className="audience-split__pulse" />
        </div>

        <div className="audience-split__panel audience-split__panel--ops">
          <h3>Operators</h3>
          <p className="audience-split__lede">Publish inventory. Never oversell capacity.</p>
          <ul>
            {operators.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{ delay: 0.35 + i * 0.12, duration: 0.45 }}
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
