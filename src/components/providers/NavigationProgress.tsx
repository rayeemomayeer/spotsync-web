"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Thin top progress strip on client navigations. */
export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const done = window.setTimeout(() => setActive(false), 420);
    return () => window.clearTimeout(done);
  }, [pathname]);

  return (
    <div
      className={`nav-progress${active ? " nav-progress--active" : ""}`}
      aria-hidden={!active}
    />
  );
}
