"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { MapCanvas } from "@/components/map/MapCanvas";
import { AuthSheet } from "@/components/overlays/AuthSheet";
import { Dock, Legend, ReserveCard, ZonePill } from "@/components/overlays/UiChrome";
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

  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [plate, setPlate] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const [shakeSpotId, setShakeSpotId] = useState<number | null>(null);
  const [ghosts, setGhosts] = useState<GhostCar[]>([]);
  const [ghostSpotIds, setGhostSpotIds] = useState<Set<number>>(new Set());
  const [liveActivity, setLiveActivity] = useState(DEMO_MODE);
  const [legendPulse, setLegendPulse] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const { data: zones = [] } = useQuery({
    queryKey: ["zones"],
    queryFn: () => api.zones(),
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

  spotsRef.current = spots;

  const freeCount = useMemo(
    () => spots.filter((s) => s.status === "available" && !s.occupied && !ghostSpotIds.has(s.id)).length,
    [spots, ghostSpotIds],
  );

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
        setLegendPulse((k) => k + 1);
      },
      onRemove: (id) => {
        setGhosts((prev) => prev.filter((g) => g.id !== id));
        setGhostSpotIds(engine.getGhostSpotIds());
        setLegendPulse((k) => k + 1);
      },
    });
    engineRef.current = engine;
    engine.start();
    return () => {
      engine.stop();
      engine.clear();
    };
  }, [liveActivity, showcaseZone?.id]);

  useEffect(() => {
    setLegendPulse((k) => k + 1);
  }, [freeCount]);

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
      if (engineRef.current) {
        engineRef.current.removeGhost(
          ghosts.find((g) => g.spotId === selectedSpot.id)?.id ?? "",
        );
      }
      setSelectedSpot(null);
      showToast(demoSession ? "Demo booking — auto-releases in 10 min" : "Spot reserved!");
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

  if (isLoading && !spots.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#C9B896] text-[#2D2A26]">
        Loading parking map…
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapCanvas
        spots={spots}
        ghostSpotIds={ghostSpotIds}
        ghosts={ghosts}
        selectedSpot={selectedSpot}
        shakeSpotId={shakeSpotId}
        onSelectSpot={handleSelectSpot}
      />

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto absolute left-4 top-4 flex items-center gap-2">
          {showcaseZone && (
            <ZonePill zoneName={showcaseZone.name} free={freeCount} total={showcaseZone.total_capacity} />
          )}
          {demoSession && <DemoBadge />}
        </div>

        <div className="pointer-events-auto absolute right-4 top-4">
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-white/92 px-3 py-1.5 text-xs shadow-md"
            >
              {user.name} · Sign out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="rounded-full bg-white/92 px-4 py-2 text-sm font-medium text-[#2D2A26] shadow-md"
            >
              Sign in
            </button>
          )}
        </div>

        <div className="pointer-events-auto absolute bottom-6 left-6">
          <Legend pulseKey={legendPulse} />
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

        <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2">
          <Dock
            onHome={() => qc.invalidateQueries()}
            onLocate={handleLocate}
            onNotifications={() => setPanelOpen(true)}
            onToggleActivity={() => setLiveActivity((v) => !v)}
            liveActivity={liveActivity}
            isAdmin={user?.role === "admin"}
            onManage={() => setPanelOpen(true)}
          />
        </div>
      </div>

      {toast && (
        <div className="absolute left-1/2 top-20 z-20 -translate-x-1/2 rounded-full bg-[#2D2A26] px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} />

      {panelOpen && token && (
        <ReservationsPanel
          token={token}
          onClose={() => setPanelOpen(false)}
          onCancel={() => qc.invalidateQueries({ queryKey: ["spots"] })}
        />
      )}
    </div>
  );
}

function ReservationsPanel({
  token,
  onClose,
  onCancel,
}: {
  token: string;
  onClose: () => void;
  onCancel: () => void;
}) {
  const { data: reservations = [] } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: () => api.myReservations(token),
  });

  return (
    <div className="fixed inset-y-0 right-0 z-30 w-80 bg-white/95 p-4 shadow-2xl backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">My reservations</h3>
        <button type="button" onClick={onClose}>
          ×
        </button>
      </div>
      <ul className="space-y-2">
        {reservations.map((r) => (
          <li key={r.id} className="rounded-lg border border-[#eee] p-3 text-sm">
            <p className="font-medium">{r.spot?.label ?? `Zone ${r.zone_id}`}</p>
            <p className="text-[#888]">{r.license_plate}</p>
            <button
              type="button"
              className="mt-2 text-xs text-red-500"
              onClick={async () => {
                await api.cancelReservation(token, r.id);
                onCancel();
              }}
            >
              Cancel
            </button>
          </li>
        ))}
        {reservations.length === 0 && <p className="text-sm text-[#888]">No reservations yet</p>}
      </ul>
    </div>
  );
}
