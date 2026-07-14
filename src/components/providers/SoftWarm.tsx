"use client";

import { useEffect } from "react";
import { startBackendWarm } from "@/lib/api/warm-backend";

/** Fire-and-forget Render cold-start wake on first paint for app shells. */
export function SoftWarm() {
  useEffect(() => {
    startBackendWarm();
  }, []);
  return null;
}
