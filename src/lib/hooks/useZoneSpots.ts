import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Spot, Zone } from "@/lib/api/types";
import { offlineShowcaseSpots } from "@/lib/spots/offline-fallback";
import { isOfflineSpotData, normalizeShowcaseSpots } from "@/lib/spots/showcase-spots";

export type ZoneSpotsResult = {
  spots: Spot[];
  online: boolean;
};

export function readZoneSpotsCache(
  data: ZoneSpotsResult | Spot[] | undefined,
  fallback: Spot[],
): ZoneSpotsResult {
  if (!data) return { spots: fallback, online: true };
  if (Array.isArray(data)) return { spots: data, online: true };
  return data;
}

export function writeZoneSpotsCache(spots: Spot[], prev: ZoneSpotsResult | Spot[] | undefined): ZoneSpotsResult {
  if (prev && !Array.isArray(prev)) {
    return { ...prev, spots };
  }
  return { spots, online: true };
}

export function useZoneSpots(activeZone: Zone | undefined, apiOnline: boolean) {
  const queryKey = useMemo(
    () => ["spots", activeZone?.id, apiOnline] as const,
    [activeZone?.id, apiOnline],
  );

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<ZoneSpotsResult> => {
      if (!activeZone || activeZone.id === 0) {
        return { spots: offlineShowcaseSpots(), online: false };
      }
      const data = await api.spots(activeZone.id);
      return {
        spots: normalizeShowcaseSpots(data, activeZone.id),
        online: true,
      };
    },
    enabled: !!activeZone && activeZone.id !== 0,
    refetchInterval: (q) => (q.state.error ? 5000 : apiOnline ? 12000 : 8000),
    retry: 5,
    retryDelay: (attempt) => Math.min(1500 * 2 ** attempt, 12_000),
    placeholderData: (prev) => prev,
  });

  const liveSpots = query.data?.online ? query.data.spots : undefined;
  const displaySpots =
    liveSpots ??
    (query.isError || (activeZone?.id === 0 && query.isFetched)
      ? offlineShowcaseSpots()
      : []);

  const spotsMatchZone =
    displaySpots.length === 0 ||
    displaySpots.every((s) => !activeZone?.id || s.zone_id === activeZone.id || s.zone_id === 0);

  const spotsOffline = !liveSpots && displaySpots.length > 0 && isOfflineSpotData(displaySpots);
  const showSkeleton =
    !!activeZone &&
    activeZone.id !== 0 &&
    !liveSpots &&
    (query.isPending || query.isFetching || !spotsMatchZone);

  return {
    queryKey,
    displaySpots,
    spotsOffline,
    showSkeleton,
    spotsOnline: !!liveSpots,
    isFetching: query.isFetching,
  };
}
