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
      try {
        const zones = await api.zones({
          q: debouncedSearch.trim() || undefined,
          type: typeFilter || undefined,
          sort: "available_spots",
          order: "desc",
        });
        return { zones, online: true };
      } catch {
        return { zones: [OFFLINE_SHOWCASE_ZONE], online: false };
      }
    },
    refetchInterval: 15000,
    retry: 1,
  });
}
