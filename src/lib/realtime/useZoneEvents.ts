"use client";

import { useEffect, useRef, useState } from "react";
import type { ZoneEvent, ZoneEventType } from "./events";

export type SseStatus = "idle" | "connecting" | "live" | "reconnecting";

function eventsUrl(zoneId: number, token: string | null): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api/v1";
  const trimmed = base.replace(/\/$/, "");
  const url = `${trimmed}/zones/${zoneId}/events`;
  if (!token) return url;
  const u = new URL(url);
  u.searchParams.set("access_token", token);
  return u.toString();
}

export function useZoneEvents(
  zoneId: number | undefined,
  token: string | null,
  handlers: Partial<Record<ZoneEventType, (event: ZoneEvent) => void>>,
): SseStatus {
  const handlersRef = useRef(handlers);
  const [status, setStatus] = useState<SseStatus>("idle");

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!zoneId || !token) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSE subscription bootstrap
    setStatus("connecting");
    const es = new EventSource(eventsUrl(zoneId, token));
    let wasLive = false;

    es.onopen = () => {
      wasLive = true;
      setStatus("live");
    };

    es.onerror = () => {
      setStatus(wasLive ? "reconnecting" : "connecting");
    };

    const listen = (type: ZoneEventType) => {
      es.addEventListener(type, (msg) => {
        try {
          const data = JSON.parse((msg as MessageEvent).data) as ZoneEvent;
          handlersRef.current[type]?.(data);
        } catch {
          /* ignore malformed */
        }
      });
    };

    listen("spot_reserved");
    listen("spot_released");
    listen("spot_expired");

    return () => {
      es.close();
      setStatus("idle");
    };
  }, [zoneId, token]);

  return zoneId && token ? status : "idle";
}
