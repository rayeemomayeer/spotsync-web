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
      try {
        const data = await api.spots(activeZone.id);
        return {
          spots: normalizeShowcaseSpots(data, activeZone.id),
          online: true,
        };
      } catch {
        return { spots: offlineShowcaseSpots(), online: false };
      }
    },
    enabled: !!activeZone,
    refetchInterval: apiOnline ? 12000 : false,
    retry: 1,
  });

  const displaySpots = query.data?.spots ?? [];
  const spotsMatchZone =
    displaySpots.length === 0 ||
    displaySpots.every((s) => !activeZone?.id || s.zone_id === activeZone.id || s.zone_id === 0);
  const spotsOffline = displaySpots.length > 0 && isOfflineSpotData(displaySpots);
  const showSkeleton =
    query.isLoading || !spotsMatchZone || (query.isFetching && displaySpots.length === 0);

  return {
    queryKey,
    displaySpots,
    spotsOffline,
    showSkeleton,
    spotsOnline: query.data?.online ?? false,
    isFetching: query.isFetching,
  };
}
