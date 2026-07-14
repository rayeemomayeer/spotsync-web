"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stops = [
  {
    title: "Search",
    copy: "Neighborhood, garage, or map pin. Availability chips refresh as spots fill or open.",
  },
  {
    title: "Pay, then reserve",
    copy: "Stripe locks capacity only after payment — no dangling holds, no oversell.",
  },
  {
    title: "Arrive",
    copy: "Plate is on the list. Cancel anytime for a test refund in demo mode.",
  },
];

export function JourneyPath() {
  const ref = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (!inView || !pathRef.current) return;
    const path = pathRef.current;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    requestAnimationFrame(() => {
      path.style.transition = "stroke-dashoffset 1.6s cubic-bezier(0.22, 1, 0.36, 1)";
      path.style.strokeDashoffset = "0";
      setDrawn(true);
    });
  }, [inView]);

  return (
    <section className="journey" ref={ref} aria-labelledby="journey-heading">
      <div className="journey__intro">
        <p className="journey__eyebrow">The trip</p>
        <h2 id="journey-heading" className="journey__title">
          From search to curb in one path
        </h2>
      </div>

      <div className="journey__stage">
        <svg
          className="journey__svg"
          viewBox="0 0 120 520"
          preserveAspectRatio="xMidYMin meet"
          aria-hidden
        >
          <path
            ref={pathRef}
            className="journey__path"
            d="M60 24 C 60 80, 20 110, 20 160 S 100 210, 100 260 S 20 320, 20 380 S 60 440, 60 496"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        <ol className="journey__stops">
          {stops.map((stop, i) => (
            <motion.li
              key={stop.title}
              className="journey__stop"
              initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
              animate={drawn ? { opacity: 1, x: 0 } : undefined}
              transition={{ delay: 0.35 + i * 0.28, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="journey__node" aria-hidden>
                <span className="journey__node-dot" />
              </span>
              <div className="journey__copy">
                <span className="journey__index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{stop.title}</h3>
                <p>{stop.copy}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
