import { useCallback, useState } from "react";
import type { FeedEntry } from "@/components/console/ActivityFeed";
import type { ZoneEvent, ZoneEventType } from "@/lib/realtime/events";

const MAX_FEED = 12;

function mergeFeed(prev: FeedEntry[], entry: FeedEntry): FeedEntry[] {
  const withoutDup = prev.filter((e) => {
    if (e.id === entry.id) return false;
    if (
      e.spotLabel === entry.spotLabel &&
      e.type === entry.type &&
      e.plate === entry.plate &&
      Math.abs(e.at.getTime() - entry.at.getTime()) < 4000
    ) {
      return false;
    }
    return true;
  });
  return [entry, ...withoutDup].slice(0, MAX_FEED);
}

export function useActivityFeed(spotLabelById: Map<number, string>) {
  const [feed, setFeed] = useState<FeedEntry[]>([]);

  const pushFromEvent = useCallback(
    (event: ZoneEvent, local: boolean) => {
      const entry: FeedEntry = {
        id: `${event.type}-${event.reservation_id}`,
        type: event.type,
        spotLabel: spotLabelById.get(event.spot_id) ?? `Spot ${event.spot_id}`,
        plate: event.license_plate,
        at: new Date(),
        local,
      };
      setFeed((prev) => mergeFeed(prev, entry));
    },
    [spotLabelById],
  );

  const pushLocal = useCallback((type: ZoneEventType, spotLabel: string, plateValue: string) => {
    const entry: FeedEntry = {
      id: `local-${type}-${spotLabel}-${Date.now()}`,
      type,
      spotLabel,
      plate: plateValue,
      at: new Date(),
      local: true,
    };
    setFeed((prev) => mergeFeed(prev, entry));
  }, []);

  return { feed, pushFromEvent, pushLocal };
}
