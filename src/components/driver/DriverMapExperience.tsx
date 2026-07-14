"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ReservePanel } from "@/components/console/ReservePanel";
import { isFeatureEnabled } from "@/lib/config/flags";
import { SpotGrid } from "@/components/console/SpotGrid";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/providers/AuthProvider";
import { api, ApiError, demoPlate } from "@/lib/api/client";
import type { Zone } from "@/lib/api/types";
import { getToken, isDemoModeActive } from "@/lib/auth/session";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useZoneSpots } from "@/lib/hooks/useZoneSpots";
import { useZones, zonesOrOffline } from "@/lib/hooks/useZones";
import { zoneMapPosition, zonePinLabel } from "@/lib/map/zone-positions";
import { nextAvailableSpot } from "@/lib/spots/grouping";
import { useZonesStream } from "@/lib/realtime/useZonesStream";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function DriverMapExperience() {
  const { user, token, demoSession } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [plate, setPlate] = useState("ABC-1234");
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const authToken = token ?? getToken();
  const isAuthed = !!user || !!authToken;
  const driverPayments = isFeatureEnabled("driver_payments");
  const useCheckout = driverPayments;
  const router = useRouter();

  const zonesQuery = useZones(debouncedSearch, "");
  const zonesResult = zonesOrOffline(zonesQuery.data, zonesQuery.isError && !zonesQuery.isFetching);
  const zones = zonesResult.zones;
  const apiOnline = zonesResult.online || zonesQuery.isFetching;

  useZonesStream(apiOnline, authToken);

  const activeZone = useMemo(() => {
    if (selectedZoneId != null) {
      return zones.find((z) => z.id === selectedZoneId) ?? zones[0] ?? null;
    }
    return zones[0] ?? null;
  }, [zones, selectedZoneId]);

  const { displaySpots, showSkeleton: showSpotSkeleton } = useZoneSpots(activeZone, apiOnline);

  const { data: myReservations = [] } = useQuery({
    queryKey: ["my-reservations", authToken ?? "anon"],
    queryFn: () => api.myReservations(authToken ?? ""),
    enabled: isAuthed && !!authToken,
  });

  const defaultSpot = useMemo(() => nextAvailableSpot(displaySpots), [displaySpots]);
  const selectedSpot = useMemo(() => {
    if (selectedSpotId != null) {
      return displaySpots.find((s) => s.id === selectedSpotId) ?? defaultSpot;
    }
    return defaultSpot;
  }, [displaySpots, selectedSpotId, defaultSpot]);

  const ownedSpotIds = useMemo(() => {
    const ids = new Set<number>();
    if (!activeZone?.id) return ids;
    for (const r of myReservations) {
      if (r.status === "active" && r.zone_id === activeZone.id && r.spot_id) {
        ids.add(r.spot_id);
      }
    }
    return ids;
  }, [myReservations, activeZone]);

  const selectZone = useCallback((zone: Zone) => {
    setSelectedZoneId(zone.id);
    setSelectedSpotId(null);
    setReserveError("");
    setSheetOpen(true);
  }, []);

  const onReserve = useCallback(async () => {
    if (!activeZone || !selectedSpot || !isAuthed) return;
    if (useCheckout) {
      const qs = new URLSearchParams({ spot: String(selectedSpot.id) });
      router.push(`/book/${activeZone.id}?${qs.toString()}`);
      return;
    }
    setReserveLoading(true);
    setReserveError("");
    try {
      // Empty token OK: BFF cookie session → Go bridge JWT.
      await api.reserve(
        authToken ?? "",
        {
          zone_id: activeZone.id,
          license_plate: plate.trim(),
          spot_id: selectedSpot.id,
        },
        demoSession || DEMO_MODE || isDemoModeActive(),
      );
      await qc.invalidateQueries({ queryKey: ["my-reservations"] });
      await qc.invalidateQueries({ queryKey: ["zone-spots", activeZone.id] });
      setPlate(demoSession || DEMO_MODE ? demoPlate() : plate);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setReserveError("Spot not found — refresh and pick again");
        await qc.invalidateQueries({ queryKey: ["zone-spots", activeZone.id] });
      } else {
        setReserveError(e instanceof ApiError ? e.message : "Reserve failed");
      }
    } finally {
      setReserveLoading(false);
    }
  }, [activeZone, selectedSpot, isAuthed, authToken, plate, demoSession, qc, useCheckout, router]);

  return (
    <div className="driver-map" data-testid="driver-map">
      <header className="driver-map__header">
        <Link href="/" className="driver-map__brand">
          SpotSync
        </Link>
        <div className="driver-map__search-wrap">
          <input
            type="search"
            className="driver-map__search"
            placeholder="Where to park?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search zones"
          />
        </div>
        <div className="driver-map__actions">
          <ThemeToggle />
          {user ? (
            <span className="driver-map__user">{user.name.split(" ")[0]}</span>
          ) : (
            <Link href="/login" className="driver-map__signin">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <div className="driver-map__canvas" role="application" aria-label="Parking map">
        <div className="driver-map__roads" />
        {!apiOnline && zones.length > 0 ? (
          <p className="driver-map__offline">Offline preview — API waking up…</p>
        ) : null}
        {zones.map((zone) => {
          const { x, y } = zoneMapPosition(zone);
          const selected = activeZone?.id === zone.id;
          const full = zone.available_spots <= 0;
          return (
            <button
              key={zone.id}
              type="button"
              className={`driver-map__pin${selected ? " driver-map__pin--selected" : ""}${full ? " driver-map__pin--full" : ""}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => selectZone(zone)}
              aria-label={`${zone.name}, ${zone.available_spots} spots free`}
            >
              <span className="driver-map__pin-dot" />
              <span className="driver-map__pin-label">{zonePinLabel(zone)}</span>
              <span className="driver-map__pin-name">{zone.name}</span>
            </button>
          );
        })}
        {zones.length === 0 && !zonesQuery.isFetching ? (
          <p className="driver-map__empty">No zones match your search.</p>
        ) : null}
      </div>

      <div className="driver-map__footer-hint">
        <Link href="/console">Ops console</Link>
      </div>

      <AnimatePresence>
        {sheetOpen && activeZone ? (
          <motion.div
            className="driver-map__sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSheetOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {sheetOpen && activeZone ? (
          <motion.section
            className="driver-map__sheet"
            data-testid="driver-booking-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="driver-map__sheet-handle" />
            <h2 className="driver-map__sheet-title">{activeZone.name}</h2>
            <p className="driver-map__sheet-meta">
              {activeZone.available_spots} / {activeZone.total_capacity} free · ${activeZone.price_per_hour}/hr ·{" "}
              {activeZone.type.replace("_", " ")}
            </p>

            {!isAuthed ? (
              <p className="driver-map__sheet-auth">
                <Link href="/login">Sign in</Link> to reserve a spot.
              </p>
            ) : showSpotSkeleton ? (
              <p>Loading spots…</p>
            ) : (
              <>
                <SpotGrid
                  spots={displaySpots}
                  selectedId={selectedSpot?.id}
                  ghostIds={new Set()}
                  shakeSpotId={null}
                  ownedIds={ownedSpotIds}
                  onSelect={(spot) => setSelectedSpotId(spot.id)}
                />
                <ReservePanel
                  spot={selectedSpot}
                  plate={plate}
                  owned={selectedSpot ? ownedSpotIds.has(selectedSpot.id) : false}
                  onPlateChange={setPlate}
                  onReserve={() => void onReserve()}
                  loading={reserveLoading}
                  error={reserveError}
                  demoMode={demoSession || DEMO_MODE}
                />
              </>
            )}
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
