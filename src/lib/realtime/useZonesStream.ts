"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ZonesQueryResult } from "@/lib/hooks/useZones";
import type { ZoneEvent, ZoneEventType } from "@/lib/realtime/events";

function streamUrl(token: string | null): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api/v1";
  const url = `${base.replace(/\/$/, "")}/zones/stream`;
  if (!token) return url;
  const u = new URL(url);
  u.searchParams.set("access_token", token);
  return u.toString();
}

function patchZoneAvailability(
  qc: ReturnType<typeof useQueryClient>,
  event: ZoneEvent,
  delta: number,
) {
  qc.setQueriesData<ZonesQueryResult>({ queryKey: ["zones"] }, (old) => {
    if (!old?.online) return old;
    return {
      ...old,
      zones: old.zones.map((zone) => {
        if (zone.id !== event.zone_id) return zone;
        const next = zone.available_spots + delta;
        return {
          ...zone,
          available_spots: Math.max(0, Math.min(zone.total_capacity, next)),
        };
      }),
    };
  });
}

export function useZonesStream(enabled: boolean, token: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled || !token) return;

    const es = new EventSource(streamUrl(token));

    const listen = (type: ZoneEventType, delta: number) => {
      es.addEventListener(type, (msg) => {
        try {
          const data = JSON.parse((msg as MessageEvent).data) as ZoneEvent;
          patchZoneAvailability(qc, data, delta);
        } catch {
          /* ignore malformed */
        }
      });
    };

    listen("spot_reserved", -1);
    listen("spot_released", 1);
    listen("spot_expired", 1);

    return () => es.close();
  }, [enabled, token, qc]);
}
