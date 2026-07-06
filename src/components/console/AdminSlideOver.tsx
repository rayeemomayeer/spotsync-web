"use client";

import { useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Reservation, Spot, Zone } from "@/lib/api/types";

type Tab = "reservations" | "spots" | "admin";

export function AdminSlideOver({
  open,
  token,
  userRole,
  zones,
  showcaseZoneId,
  onClose,
  onRefresh,
  onCancel,
}: {
  open: boolean;
  token: string;
  userRole: string;
  zones: Zone[];
  showcaseZoneId?: number;
  onClose: () => void;
  onRefresh: () => void;
  onCancel?: (reservation: Reservation) => void;
}) {
  const isAdmin = userRole === "admin";
  const isDemoAdmin = userRole === "demo_admin";
  const [tab, setTab] = useState<Tab>("reservations");
  const [adminPage, setAdminPage] = useState(1);
  const [zoneId, setZoneId] = useState(showcaseZoneId ?? zones[0]?.id);
  const qc = useQueryClient();

  const { data: myReservations = [] } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: () => api.myReservations(token),
    enabled: open && tab === "reservations",
  });

  const { data: adminData } = useQuery({
    queryKey: ["admin-reservations", adminPage],
    queryFn: () => api.allReservations(token, adminPage, 8),
    enabled: open && tab === "admin" && isAdmin,
  });

  const { data: zoneSpots = [] } = useQuery({
    queryKey: ["spots", zoneId],
    queryFn: () => api.spots(zoneId!),
    enabled: open && tab === "spots" && isAdmin && !!zoneId,
  });

  async function toggleSpot(spot: Spot) {
    const next = spot.status === "available" ? "unavailable" : "available";
    await api.updateSpotStatus(token, spot.zone_id, spot.id, next);
    await qc.invalidateQueries({ queryKey: ["spots"] });
    onRefresh();
  }

  if (!open) return null;

  return (
    <>
      <button type="button" className="console-slideover-backdrop" onClick={onClose} aria-label="Close panel" />
      <div className="console-slideover">
        <div className="console-slideover__header">
          <div className="console-slideover__tabs">
            <TabButton active={tab === "reservations"} onClick={() => setTab("reservations")}>
              My bookings
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
          <button type="button" onClick={onClose} className="console-btn console-btn--text" aria-label="Close">
            ×
          </button>
        </div>

        <div className="console-slideover__body">
          {isDemoAdmin && tab !== "reservations" && (
            <p className="console-demo-admin-note">Demo admin can reserve spots only — management tools require full admin.</p>
          )}

          {tab === "reservations" && (
            <ul className="console-booking-list">
              {myReservations
                .filter((r) => r.status === "active")
                .map((r) => (
                <li key={r.id} className="console-booking-card">
                  <p className="console-booking-card__spot">{r.spot?.label ?? `Zone ${r.zone_id}`}</p>
                  <p className="console-booking-card__plate">{r.license_plate}</p>
                  <button
                    type="button"
                    className="console-btn console-btn--danger-text"
                    onClick={async () => {
                      await api.cancelReservation(token, r.id);
                      onCancel?.(r);
                      onRefresh();
                    }}
                  >
                    Cancel
                  </button>
                </li>
              ))}
              {myReservations.filter((r) => r.status === "active").length === 0 && (
                <p className="console-empty">No active reservations</p>
              )}
            </ul>
          )}

          {tab === "spots" && isAdmin && (
            <>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(Number(e.target.value))}
                className="console-input console-input--select"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
              <ul className="console-spot-admin-list">
                {zoneSpots.map((s) => (
                  <li key={s.id} className="console-spot-admin-row">
                    <span>
                      {s.label}
                      {s.occupied && <span className="console-muted"> · occupied</span>}
                    </span>
                    <button
                      type="button"
                      disabled={s.occupied}
                      onClick={() => toggleSpot(s)}
                      className="console-btn console-btn--text"
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
              <p className="console-muted">
                Page {adminData.page} · {adminData.total} total
              </p>
              <ul className="console-booking-list">
                {adminData.items.map((r) => (
                  <li key={r.id} className="console-booking-card console-booking-card--compact">
                    <p className="console-booking-card__plate">{r.license_plate}</p>
                    <p className="console-muted">
                      {r.spot?.label ?? `zone ${r.zone_id}`} · {r.status}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="console-pagination">
                <button
                  type="button"
                  disabled={adminPage <= 1}
                  onClick={() => setAdminPage((p) => p - 1)}
                  className="console-btn console-btn--text"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={adminPage * adminData.limit >= adminData.total}
                  onClick={() => setAdminPage((p) => p + 1)}
                  className="console-btn console-btn--text"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
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
      className={`console-tab ${active ? "console-tab--active" : ""}`}
    >
      {children}
    </button>
  );
}
