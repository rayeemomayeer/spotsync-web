"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ActivityFeed } from "@/components/console/ActivityFeed";
import { AdminSlideOver } from "@/components/console/AdminSlideOver";
import { ApiEnvBanner } from "@/components/console/ApiEnvBanner";
import { AvailabilityMeter, SpotGrid } from "@/components/console/SpotGrid";
import { MobileTabBar, type MobileTab } from "@/components/console/MobileTabBar";
import { SpotGridSkeleton } from "@/components/console/SpotGridSkeleton";
import { ReservePanel } from "@/components/console/ReservePanel";
import { TopBar } from "@/components/console/TopBar";
import { ZoneRail } from "@/components/console/ZoneRail";
import { AuthSheet } from "@/components/overlays/AuthSheet";
import { useAuth } from "@/components/providers/AuthProvider";
import { api, ApiError, DEMO_CREDENTIALS, demoPlate } from "@/lib/api/client";
import type { Reservation, Spot } from "@/lib/api/types";
import { getToken } from "@/lib/auth/session";
import { useGhostGrid } from "@/lib/demo/ghost-grid";
import { useActivityFeed } from "@/lib/hooks/useActivityFeed";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useZoneSpots, readZoneSpotsCache, writeZoneSpotsCache, type ZoneSpotsResult } from "@/lib/hooks/useZoneSpots";
import { useZones, zonesOrOffline } from "@/lib/hooks/useZones";
import { useZoneEvents } from "@/lib/realtime/useZoneEvents";
import { useZonesStream } from "@/lib/realtime/useZonesStream";
import { nextAvailableSpot, pickShowcaseZone } from "@/lib/spots/grouping";
import { OFFLINE_SHOWCASE_ZONE } from "@/lib/spots/offline-fallback";
import { patchSpotOccupied, patchSpotReleased } from "@/lib/spots/showcase-spots";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const GHOST_DEMO = process.env.NEXT_PUBLIC_DEMO_GHOST_GRID === "true";

const EMPTY_GHOST_IDS = new Set<number>();

export function LiveConsole() {
  const { user, token, demoSession, login } = useAuth();
  const qc = useQueryClient();

  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [zoneSearch, setZoneSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [plate, setPlate] = useState("ABC-1234");
  const [authOpen, setAuthOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const [shakeSpotId, setShakeSpotId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("grid");

  const debouncedSearch = useDebounce(zoneSearch, 300);
  const authToken = token ?? getToken();
  const isAuthed = !!user || !!authToken;

  const zonesQuery = useZones(debouncedSearch, typeFilter);
  const zonesResult = zonesOrOffline(zonesQuery.data, zonesQuery.isError && !zonesQuery.isFetching);
  const zones = zonesResult.zones;
  const apiOnline = zonesResult.online || zonesQuery.isFetching;

  useZonesStream(apiOnline, authToken);

  const activeZone = useMemo(() => {
    if (selectedZoneId !== null) {
      const found = zones.find((z) => z.id === selectedZoneId);
      if (found) return found;
    }
    return pickShowcaseZone(zones, OFFLINE_SHOWCASE_ZONE);
  }, [zones, selectedZoneId]);

  const {
    queryKey: spotsQueryKey,
    displaySpots,
    spotsOffline,
    showSkeleton: showSpotSkeleton,
    spotsOnline,
  } = useZoneSpots(activeZone, apiOnline);

  const effectiveApiOnline = apiOnline && (activeZone?.id === 0 || spotsOnline || showSpotSkeleton);

  const { data: myReservations = [] } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: () => api.myReservations(authToken ?? ""),
    enabled: isAuthed,
  });

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

  const spotLabelById = useMemo(
    () => new Map(displaySpots.map((s) => [s.id, s.label])),
    [displaySpots],
  );
  const ghostEnabled = !authToken && (demoSession || DEMO_MODE) && GHOST_DEMO;
  const ghostIdsRaw = useGhostGrid(showSpotSkeleton ? [] : displaySpots, ghostEnabled);
  const ghostIds = ghostEnabled ? ghostIdsRaw : EMPTY_GHOST_IDS;

  const { feed, pushFromEvent, pushLocal } = useActivityFeed(spotLabelById);

  const defaultSpot = useMemo(() => nextAvailableSpot(displaySpots), [displaySpots]);

  const selectedSpot = useMemo(() => {
    if (selectedSpotId !== null) {
      const found = displaySpots.find((s) => s.id === selectedSpotId);
      if (found) return found;
    }
    return defaultSpot;
  }, [displaySpots, selectedSpotId, defaultSpot]);

  const gridFreeCount = useMemo(
    () => displaySpots.filter((s) => s.status === "available" && !s.occupied && !ghostIds.has(s.id)).length,
    [displaySpots, ghostIds],
  );

  const meterFree =
    effectiveApiOnline && !spotsOffline && activeZone ? activeZone.available_spots : gridFreeCount;
  const meterTotal =
    effectiveApiOnline && !spotsOffline && activeZone ? activeZone.total_capacity : displaySpots.length;
  const lastSpotStress = meterFree === 1;

  const refreshAll = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["spots"] });
    qc.invalidateQueries({ queryKey: ["zones"] });
    qc.invalidateQueries({ queryKey: ["my-reservations"] });
    qc.invalidateQueries({ queryKey: ["admin-reservations"] });
  }, [qc]);

  const sseStatus = useZoneEvents(
    activeZone?.id && activeZone.id > 0 ? activeZone.id : undefined,
    authToken,
    {
      spot_reserved: (event) => {
        pushFromEvent(event, user?.id === event.user_id);
        refreshAll();
      },
      spot_released: (event) => {
        pushFromEvent(event, user?.id === event.user_id);
        refreshAll();
      },
      spot_expired: (event) => {
        pushFromEvent(event, user?.id === event.user_id);
        refreshAll();
      },
    },
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleSelectSpot = (spot: Spot) => {
    setSelectedSpotId(spot.id);
    if (!plate || plate === "ABC-1234") {
      setPlate(demoSession || DEMO_MODE ? demoPlate() : "ABC-1234");
    }
    setReserveError("");
  };

  const handleZoneSelect = (zoneId: number) => {
    setSelectedZoneId(zoneId);
    setSelectedSpotId(null);
    setMobileTab("grid");
  };

  const ensureAuth = async (): Promise<string | null> => {
    if (isAuthed) return token ?? getToken() ?? "";
    if (DEMO_MODE) {
      try {
        const { email, password } = DEMO_CREDENTIALS.driver;
        await login(email, password, true);
        return getToken();
      } catch {
        setAuthOpen(true);
        return null;
      }
    }
    setAuthOpen(true);
    return null;
  };

  const handleReserve = async () => {
    if (!selectedSpot || !activeZone) return;
    if (!effectiveApiOnline || activeZone.id === 0) {
      setReserveError("API offline — start SpotSync backend");
      return;
    }
    if (spotsOffline) {
      setReserveError("Spots not seeded — run: go run ./cmd/seed");
      return;
    }
    const reserveToken = await ensureAuth();
    if (!reserveToken) return;

    const reservedSpot = selectedSpot;
    const reservedPlate = plate;
    const cached = qc.getQueryData<ZoneSpotsResult | Spot[]>(spotsQueryKey);
    const { spots: previousSpots, online: spotsOnlineFlag } = readZoneSpotsCache(cached, displaySpots);

    qc.setQueryData(
      spotsQueryKey,
      writeZoneSpotsCache(patchSpotOccupied(previousSpots, reservedSpot.id, true), cached),
    );
    pushLocal("spot_reserved", reservedSpot.label, reservedPlate);

    setReserveLoading(true);
    setReserveError("");
    try {
      await api.reserve(
        reserveToken,
        {
          zone_id: activeZone.id,
          license_plate: reservedPlate,
          spot_id: reservedSpot.id,
        },
        demoSession || DEMO_MODE,
      );

      const optimisticSpots = patchSpotOccupied(previousSpots, reservedSpot.id, true);
      qc.setQueryData(
        spotsQueryKey,
        writeZoneSpotsCache(optimisticSpots, { spots: previousSpots, online: spotsOnlineFlag }),
      );

      const next = nextAvailableSpot(optimisticSpots, reservedSpot.id);
      setSelectedSpotId(next?.id ?? null);
      if (next && (demoSession || DEMO_MODE)) {
        setPlate(demoPlate());
      }

      showToast(demoSession || DEMO_MODE ? "Demo booking — auto-releases in 10 min" : "Spot reserved!");
      void qc.invalidateQueries({ queryKey: ["zones"] });
      void qc.invalidateQueries({ queryKey: ["my-reservations"] });
    } catch (e) {
      qc.setQueryData(
        spotsQueryKey,
        writeZoneSpotsCache(previousSpots, { spots: previousSpots, online: spotsOnlineFlag }),
      );
      if (e instanceof ApiError && e.status === 409) {
        setShakeSpotId(reservedSpot.id);
        setTimeout(() => setShakeSpotId(null), 500);
        setReserveError("Spot taken");
        void qc.invalidateQueries({ queryKey: spotsQueryKey });
      } else {
        setReserveError(e instanceof Error ? e.message : "Reservation failed");
      }
    } finally {
      setReserveLoading(false);
    }
  };

  const handleCancelReservation = useCallback(
    (reservation: Reservation) => {
      if (reservation.spot_id && reservation.zone_id === activeZone?.id) {
        const cached = qc.getQueryData<ZoneSpotsResult | Spot[]>(spotsQueryKey);
        const { spots: previousSpots } = readZoneSpotsCache(cached, displaySpots);
        qc.setQueryData(
          spotsQueryKey,
          writeZoneSpotsCache(patchSpotReleased(previousSpots, reservation.spot_id), cached),
        );
      }
      const label = reservation.spot?.label ?? spotLabelById.get(reservation.spot_id ?? 0) ?? "Spot";
      pushLocal("spot_released", label, reservation.license_plate);
      showToast("Reservation cancelled");
      void qc.invalidateQueries({ queryKey: ["zones"] });
    },
    [activeZone?.id, displaySpots, pushLocal, qc, showToast, spotLabelById, spotsQueryKey],
  );

  const selectedOwned = selectedSpot ? ownedSpotIds.has(selectedSpot.id) : false;

  const zoneRail = (
    <ZoneRail
      zones={zones}
      selectedId={activeZone?.id}
      search={zoneSearch}
      typeFilter={typeFilter}
      onSearchChange={setZoneSearch}
      onTypeChange={setTypeFilter}
      onSelect={(z) => handleZoneSelect(z.id)}
    />
  );

  const mainPanel = (
    <main className="console-main">
      <header className="console-main__header">
        <div>
          <h1 className="console-main__title">{activeZone?.name ?? "Parking zone"}</h1>
          {showSpotSkeleton && apiOnline && <p className="console-muted">Loading spots…</p>}
        </div>
        {!showSpotSkeleton && (
          <AvailabilityMeter free={meterFree} total={meterTotal} stress={lastSpotStress} />
        )}
      </header>

      {!showSpotSkeleton && (
        <div className="console-legend" aria-label="Spot legend">
          <span><i className="console-legend__swatch console-legend__swatch--free" /> Available</span>
          <span><i className="console-legend__swatch console-legend__swatch--busy" /> Occupied</span>
          <span><i className="console-legend__swatch console-legend__swatch--owned" /> Your booking</span>
          <span><i className="console-legend__swatch console-legend__swatch--blocked" /> Unavailable</span>
          {ghostEnabled && (
            <span><i className="console-legend__swatch console-legend__swatch--ghost" /> Simulated</span>
          )}
        </div>
      )}

      {showSpotSkeleton ? (
        <SpotGridSkeleton />
      ) : (
        <SpotGrid
          spots={displaySpots}
          selectedId={selectedSpot?.id}
          shakeSpotId={shakeSpotId}
          ghostIds={ghostIds}
          ownedIds={ownedSpotIds}
          stress={lastSpotStress}
          showGhostLegend={ghostEnabled}
          onSelect={handleSelectSpot}
        />
      )}
    </main>
  );

  const sidebar = (
    <aside className="console-sidebar">
      <ActivityFeed entries={feed} />
      <ReservePanel
        spot={selectedSpot}
        plate={plate}
        owned={selectedOwned}
        onPlateChange={setPlate}
        onReserve={handleReserve}
        loading={reserveLoading}
        error={reserveError}
        demoMode={demoSession || DEMO_MODE}
      />
      <button
        type="button"
        className="console-btn console-btn--secondary console-btn--full"
        onClick={() => {
          if (!isAuthed) {
            setAuthOpen(true);
            return;
          }
          setPanelOpen(true);
        }}
      >
        My bookings & admin
      </button>
    </aside>
  );

  return (
    <div className="console-root">
      <TopBar apiOnline={effectiveApiOnline} sseStatus={sseStatus} onSignIn={() => setAuthOpen(true)} />
      <ApiEnvBanner />

      {!effectiveApiOnline && (
        <p className="console-banner console-banner--warn">API offline — showing demo data. Start the SpotSync backend.</p>
      )}
      {effectiveApiOnline && spotsOffline && !showSpotSkeleton && (
        <p className="console-banner console-banner--warn">
          Spots API unreachable (cold start or timeout) — showing offline preview. Wait a few seconds and refresh;
          data is seeded in production.
        </p>
      )}

      <MobileTabBar active={mobileTab} onChange={setMobileTab} />

      <div className={`console-layout console-layout--tab-${mobileTab}`}>
        {zoneRail}
        {mainPanel}
        {sidebar}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="console-toast"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} />

      {panelOpen && isAuthed && user && (
        <AdminSlideOver
          open={panelOpen}
          token={authToken ?? ""}
          userRole={user.role}
          zones={zones}
          showcaseZoneId={activeZone?.id}
          onClose={() => setPanelOpen(false)}
          onRefresh={refreshAll}
          onCancel={handleCancelReservation}
        />
      )}
    </div>
  );
}
