"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const bands = [
  {
    id: "live-map",
    eyebrow: "Live capacity",
    title: "Spots change. The map keeps up.",
    copy: "SSE feeds zone free counts while you browse. Pick a stall on the grid — no stale inventory, no surprise full lots.",
    href: "/driver",
    cta: "Open driver map",
    image: "/reference-desktop-map.png" as string | null,
    imageAlt: "SpotSync driver map with zone pins and live availability",
    flip: false,
  },
  {
    id: "ops",
    eyebrow: "Ops console",
    title: "Three columns. One invariant.",
    copy: "Zones, spot grid, and reserve panel stay in sync. The capacity rule lives in the service layer — the UI just shows truth.",
    href: "/console",
    cta: "Peek live console",
    image: "/live-console.png" as string | null,
    imageAlt: "SpotSync live operations console with zones and spot grid",
    flip: true,
  },
  {
    id: "checkout",
    eyebrow: "Pay then reserve",
    title: "Checkout that matches how you ride.",
    copy: "Quote hours, pay in Stripe test mode, reservation lands only after success. Demo mode confirms without a card when you need a walkthrough.",
    href: "/search",
    cta: "Find a zone",
    image: null as string | null,
    imageAlt: "",
    flip: false,
  },
];

function Band({ band }: { band: (typeof bands)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });

  return (
    <div ref={ref}>
      <motion.article
        className={`editorial-band${band.flip ? " editorial-band--flip" : ""}`}
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="editorial-band__copy">
          <p className="editorial-band__eyebrow">{band.eyebrow}</p>
          <h3 className="editorial-band__title">{band.title}</h3>
          <p className="editorial-band__body">{band.copy}</p>
          <Link href={band.href} className="editorial-band__link">
            {band.cta}
            <span aria-hidden> →</span>
          </Link>
        </div>
        <div className="editorial-band__media">
          {band.image ? (
            <Image
              src={band.image}
              alt={band.imageAlt}
              width={960}
              height={640}
              className="editorial-band__img"
              sizes="(max-width: 900px) 100vw, 52vw"
            />
          ) : (
            <div className="editorial-band__receipt" aria-hidden>
              <div className="editorial-band__receipt-row">
                <span>Zone</span>
                <span>Harbor Lot B</span>
              </div>
              <div className="editorial-band__receipt-row">
                <span>Duration</span>
                <span className="font-mono">2h</span>
              </div>
              <div className="editorial-band__receipt-row">
                <span>Spot</span>
                <span className="font-mono">#14</span>
              </div>
              <div className="editorial-band__receipt-total">
                <span>Total</span>
                <strong className="font-mono">$12.00</strong>
              </div>
              <div className="editorial-band__receipt-step">
                <span className="editorial-band__receipt-dot" />
                Payment confirmed · reserving…
              </div>
            </div>
          )}
        </div>
      </motion.article>
    </div>
  );
}

export function EditorialFeatures() {
  return (
    <section className="editorial" aria-labelledby="editorial-heading">
      <div className="editorial__intro">
        <p className="editorial__eyebrow">Product</p>
        <h2 id="editorial-heading" className="editorial__title">
          Designed around the trip, not the dashboard
        </h2>
      </div>
      <div className="editorial__bands">
        {bands.map((band) => (
          <Band key={band.id} band={band} />
        ))}
      </div>
    </section>
  );
}
