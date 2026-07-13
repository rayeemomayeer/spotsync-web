import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Zone } from "@/lib/api/types";
import { OFFLINE_SHOWCASE_ZONE } from "@/lib/spots/offline-fallback";

export type ZonesQueryResult = {
  zones: Zone[];
  online: boolean;
};

export function useZones(debouncedSearch: string, typeFilter: string) {
  return useQuery({
    queryKey: ["zones", debouncedSearch, typeFilter],
    queryFn: async (): Promise<ZonesQueryResult> => {
      const zones = await api.zones({
        q: debouncedSearch.trim() || undefined,
        type: typeFilter || undefined,
        sort: "available_spots",
        order: "desc",
      });
      return { zones, online: true };
    },
    refetchInterval: (query) => (query.state.data?.online === false || query.state.error ? 5000 : 15000),
    retry: 4,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    placeholderData: (prev) => prev,
  });
}

/** Soft offline fallback for UI when zones query has never succeeded. */
export function zonesOrOffline(data: ZonesQueryResult | undefined, isError: boolean): ZonesQueryResult {
  if (data?.zones?.length) return data;
  if (isError) return { zones: [OFFLINE_SHOWCASE_ZONE], online: false };
  return { zones: [], online: false };
}
