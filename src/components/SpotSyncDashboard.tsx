"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { MapCanvas } from "@/components/map/MapCanvas";
import { AuthSheet } from "@/components/overlays/AuthSheet";
import { SidePanel } from "@/components/overlays/SidePanel";
import {
  Dock,
  Legend,
  ReserveCard,
  SearchBar,
  SpotTooltip,
  ZonePill,
} from "@/components/overlays/UiChrome";
import { DemoBadge } from "@/components/demo/DemoLoginButtons";
import { useAuth } from "@/components/providers/AuthProvider";
import { api, ApiError, demoPlate } from "@/lib/api/client";
import type { Spot } from "@/lib/api/types";
import { SimulationEngine, type GhostCar } from "@/lib/simulation/engine";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function SpotSyncDashboard() {
  const { user, token, demoSession, logout } = useAuth();
  const qc = useQueryClient();
  const engineRef = useRef<SimulationEngine | null>(null);
  const spotsRef = useRef<Spot[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [hoveredSpot, setHoveredSpot] = useState<Spot | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState("");
  const [plate, setPlate] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const [shakeSpotId, setShakeSpotId] = useState<number | null>(null);
  const [ghosts, setGhosts] = useState<GhostCar[]>([]);
  const [ghostSpotIds, setGhostSpotIds] = useState<Set<number>>(new Set());
  const [liveActivity, setLiveActivity] = useState(DEMO_MODE);
  const [toast, setToast] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const { data: zones = [] } = useQuery({
    queryKey: ["zones", search],
    queryFn: () => api.zones(search.trim() ? { q: search.trim() } : undefined),
    refetchInterval: 8000,
  });

  const showcaseZone = useMemo(
    () => zones.find((z) => z.name.includes("EV Lot")) ?? zones[0],
    [zones],
  );

  const { data: spots = [], isLoading } = useQuery({
    queryKey: ["spots", showcaseZone?.id],
    queryFn: () => api.spots(showcaseZone!.id),
    enabled: !!showcaseZone,
    refetchInterval: 5000,
  });

  const visibleSpots = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return spots;
    return spots.filter((s) => s.label.toLowerCase().includes(q));
  }, [spots, search]);

  useEffect(() => {
    spotsRef.current = visibleSpots;
  }, [visibleSpots]);

  const freeCount = useMemo(
    () => spots.filter((s) => s.status === "available" && !s.occupied && !ghostSpotIds.has(s.id)).length,
    [spots, ghostSpotIds],
  );

  const lastSpotStress = freeCount === 1;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!liveActivity || !showcaseZone) {
      engineRef.current?.stop();
      return;
    }

    const engine = new SimulationEngine({
      enabled: true,
      getAvailableSpots: () => spotsRef.current,
      onSpawn: (ghost) => {
        setGhosts((prev) => [...prev, ghost]);
        setGhostSpotIds(engine.getGhostSpotIds());
      },
      onRemove: (id) => {
        setGhosts((prev) => prev.filter((g) => g.id !== id));
        setGhostSpotIds(engine.getGhostSpotIds());
      },
    });
    engineRef.current = engine;
    engine.start();
    return () => {
      engine.stop();
      engine.clear();
    };
  }, [liveActivity, showcaseZone?.id]);

  const handleSelectSpot = (spot: Spot) => {
    setSelectedSpot(spot);
    setPlate(demoSession || DEMO_MODE ? demoPlate() : "");
    setReserveError("");
    if (!token) setAuthOpen(true);
  };

  const handleReserve = async () => {
    if (!selectedSpot || !showcaseZone || !token) {
      setAuthOpen(true);
      return;
    }
    setReserveLoading(true);
    setReserveError("");
    try {
      await api.reserve(
        token,
        {
          zone_id: showcaseZone.id,
          license_plate: plate,
          spot_id: selectedSpot.id,
        },
        demoSession || DEMO_MODE,
      );
      await qc.invalidateQueries({ queryKey: ["spots"] });
      await qc.invalidateQueries({ queryKey: ["zones"] });
      await qc.invalidateQueries({ queryKey: ["my-reservations"] });
      if (engineRef.current) {
        engineRef.current.removeGhost(
          ghosts.find((g) => g.spotId === selectedSpot.id)?.id ?? "",
        );
      }
      setSelectedSpot(null);
      showToast(demoSession || DEMO_MODE ? "Demo booking — auto-releases in 10 min" : "Spot reserved!");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setShakeSpotId(selectedSpot.id);
        setTimeout(() => setShakeSpotId(null), 500);
        setReserveError("Spot taken — never oversell enforced");
      } else {
        setReserveError(e instanceof Error ? e.message : "Reservation failed");
      }
    } finally {
      setReserveLoading(false);
    }
  };

  const handleLocate = () => {
    const next = spots.find((s) => s.status === "available" && !s.occupied && !ghostSpotIds.has(s.id));
    if (next) handleSelectSpot(next);
    else showToast("No available spots right now");
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!hoveredSpot || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 36 });
  };

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["spots"] });
    qc.invalidateQueries({ queryKey: ["zones"] });
    qc.invalidateQueries({ queryKey: ["my-reservations"] });
    qc.invalidateQueries({ queryKey: ["admin-reservations"] });
  };

  if (isLoading && !spots.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#D4C4A8] text-[#2D2A26]">
        Loading parking map…
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div ref={mapRef} className="absolute inset-0" onMouseMove={handleMapMouseMove}>
        <MapCanvas
          spots={visibleSpots}
          ghostSpotIds={ghostSpotIds}
          ghosts={ghosts}
          selectedSpot={selectedSpot}
          hoveredSpot={hoveredSpot}
          shakeSpotId={shakeSpotId}
          stressHighlight={lastSpotStress}
          onSelectSpot={handleSelectSpot}
          onHoverSpot={setHoveredSpot}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto absolute left-5 top-5 flex flex-col gap-2">
          {showcaseZone && (
            <ZonePill
              zoneName={showcaseZone.name}
              free={freeCount}
              total={showcaseZone.total_capacity}
              stress={lastSpotStress}
            />
          )}
          {demoSession && <DemoBadge />}
          {user && (
            <button
              type="button"
              onClick={logout}
              className="w-fit rounded-full bg-white/95 px-3 py-1 text-xs text-[#666] shadow-sm"
            >
              Sign out
            </button>
          )}
        </div>

        <div className="pointer-events-auto absolute right-5 top-5">
          <SearchBar
            value={search}
            onChange={setSearch}
            signedIn={!!user}
            onSignIn={() => setAuthOpen(true)}
          />
        </div>

        <div className="pointer-events-auto absolute bottom-6 left-6">
          <Legend pulseKey={freeCount + ghosts.length} />
        </div>

        <div className="pointer-events-auto absolute bottom-6 right-6">
          <AnimatePresence>
            {selectedSpot && token && (
              <ReserveCard
                spot={selectedSpot}
                plate={plate}
                onPlateChange={setPlate}
                onReserve={handleReserve}
                onClose={() => setSelectedSpot(null)}
                loading={reserveLoading}
                error={reserveError}
                demoMode={demoSession || DEMO_MODE}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="pointer-events-auto absolute bottom-3 left-1/2 -translate-x-1/2">
          <Dock
            onHome={refreshAll}
            onLocate={handleLocate}
            onNotifications={() => setPanelOpen(true)}
            onToggleActivity={() => setLiveActivity((v) => !v)}
            liveActivity={liveActivity}
          />
        </div>
      </div>

      {hoveredSpot && <SpotTooltip spot={hoveredSpot} x={tooltipPos.x} y={tooltipPos.y} />}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 top-24 z-20 -translate-x-1/2 rounded-full bg-[#2D2A26] px-4 py-2 text-sm text-white shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} />

      {panelOpen && token && user && (
        <SidePanel
          token={token}
          userRole={user.role}
          zones={zones}
          showcaseZoneId={showcaseZone?.id}
          onClose={() => setPanelOpen(false)}
          onRefresh={refreshAll}
        />
      )}
    </div>
  );
}
