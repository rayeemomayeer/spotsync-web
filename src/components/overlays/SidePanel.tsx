"use client";

import { useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Spot, Zone } from "@/lib/api/types";

type Tab = "reservations" | "spots" | "admin";

export function SidePanel({
  token,
  userRole,
  zones,
  showcaseZoneId,
  onClose,
  onRefresh,
}: {
  token: string;
  userRole: string;
  zones: Zone[];
  showcaseZoneId?: number;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const isAdmin = userRole === "admin";
  const [tab, setTab] = useState<Tab>("reservations");
  const [adminPage, setAdminPage] = useState(1);
  const [zoneId, setZoneId] = useState(showcaseZoneId ?? zones[0]?.id);
  const qc = useQueryClient();

  const { data: myReservations = [] } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: () => api.myReservations(token),
    enabled: tab === "reservations",
  });

  const { data: adminData } = useQuery({
    queryKey: ["admin-reservations", adminPage],
    queryFn: () => api.allReservations(token, adminPage, 8),
    enabled: tab === "admin" && isAdmin,
  });

  const { data: zoneSpots = [] } = useQuery({
    queryKey: ["spots", zoneId],
    queryFn: () => api.spots(zoneId!),
    enabled: tab === "spots" && isAdmin && !!zoneId,
  });

  async function toggleSpot(spot: Spot) {
    const next = spot.status === "available" ? "unavailable" : "available";
    await api.updateSpotStatus(token, spot.zone_id, spot.id, next);
    await qc.invalidateQueries({ queryKey: ["spots"] });
    onRefresh();
  }

  return (
    <div className="fixed inset-y-0 right-0 z-30 flex w-80 flex-col bg-white/96 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-[#EEE] px-4 py-3">
        <div className="flex gap-2 text-xs">
          <TabButton active={tab === "reservations"} onClick={() => setTab("reservations")}>
            Mine
          </TabButton>
          {isAdmin && (
            <>
              <TabButton active={tab === "spots"} onClick={() => setTab("spots")}>
                Spots
              </TabButton>
              <TabButton active={tab === "admin"} onClick={() => setTab("admin")}>
                All
              </TabButton>
            </>
          )}
        </div>
        <button type="button" onClick={onClose} className="text-[#999] hover:text-[#333]" aria-label="Close panel">
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "reservations" && (
          <ul className="space-y-2">
            {myReservations.map((r) => (
              <li key={r.id} className="rounded-xl border border-[#EEE] p-3 text-sm">
                <p className="font-semibold text-[#2D2A26]">{r.spot?.label ?? `Zone ${r.zone_id}`}</p>
                <p className="text-[#888]">{r.license_plate}</p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-red-500"
                  onClick={async () => {
                    await api.cancelReservation(token, r.id);
                    onRefresh();
                  }}
                >
                  Cancel
                </button>
              </li>
            ))}
            {myReservations.length === 0 && <p className="text-sm text-[#888]">No reservations yet</p>}
          </ul>
        )}

        {tab === "spots" && isAdmin && (
          <>
            <select
              value={zoneId}
              onChange={(e) => setZoneId(Number(e.target.value))}
              className="mb-3 w-full rounded-lg border border-[#EEE] px-2 py-1.5 text-sm"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
            <ul className="space-y-1">
              {zoneSpots.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg border border-[#EEE] px-2 py-1.5 text-sm">
                  <span>
                    {s.label}
                    <span className="ml-1 text-[#999]">{s.occupied ? "· occupied" : ""}</span>
                  </span>
                  <button
                    type="button"
                    disabled={s.occupied}
                    onClick={() => toggleSpot(s)}
                    className="text-xs font-medium text-[#7EC8E3] disabled:opacity-40"
                  >
                    {s.status === "available" ? "Block" : "Open"}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === "admin" && isAdmin && adminData && (
          <>
            <p className="mb-2 text-xs text-[#888]">
              Page {adminData.page} · {adminData.total} total
            </p>
            <ul className="space-y-2">
              {adminData.items.map((r) => (
                <li key={r.id} className="rounded-lg border border-[#EEE] p-2 text-xs">
                  <p className="font-medium">{r.license_plate}</p>
                  <p className="text-[#888]">
                    {r.spot?.label ?? `zone ${r.zone_id}`} · {r.status}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between">
              <button
                type="button"
                disabled={adminPage <= 1}
                onClick={() => setAdminPage((p) => p - 1)}
                className="text-xs text-[#7EC8E3] disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={adminPage * adminData.limit >= adminData.total}
                onClick={() => setAdminPage((p) => p + 1)}
                className="text-xs text-[#7EC8E3] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 font-medium ${active ? "bg-[#7EC8E3]/20 text-[#2D6A7E]" : "text-[#888]"}`}
    >
      {children}
    </button>
  );
}
