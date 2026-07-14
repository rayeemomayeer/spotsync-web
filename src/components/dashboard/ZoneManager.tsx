"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { api, ApiError } from "@/lib/api/client";
import type { Zone } from "@/lib/api/types";

const ZONE_TYPES = [
  { value: "general", label: "General" },
  { value: "ev_charging", label: "EV charging" },
  { value: "covered", label: "Covered" },
] as const;

type ZoneType = (typeof ZONE_TYPES)[number]["value"];

export function ZoneManager({
  token,
  filterOrgId,
  title = "Zones",
}: {
  token: string | null;
  /** When set, only show zones for this org (org admin). */
  filterOrgId?: number | null;
  title?: string;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<ZoneType>("general");
  const [capacity, setCapacity] = useState(20);
  const [price, setPrice] = useState(5);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Zone | null>(null);

  const zonesQuery = useQuery({
    queryKey: ["admin-zones"],
    queryFn: () => api.zones(),
  });

  const zones = (zonesQuery.data ?? []).filter((z) => {
    if (filterOrgId == null) return true;
    return z.organization_id === filterOrgId;
  });

  const create = useMutation({
    mutationFn: () =>
      api.createZone(token, {
        name: name.trim(),
        type,
        total_capacity: capacity,
        price_per_hour: price,
      }),
    onSuccess: async () => {
      setName("");
      setError("");
      await qc.invalidateQueries({ queryKey: ["admin-zones"] });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Create failed"),
  });

  const update = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("No zone");
      return api.updateZone(token, editing.id, {
        name: name.trim(),
        type,
        total_capacity: capacity,
        price_per_hour: price,
      });
    },
    onSuccess: async () => {
      setEditing(null);
      setName("");
      setError("");
      await qc.invalidateQueries({ queryKey: ["admin-zones"] });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Update failed"),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.deleteZone(token, id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-zones"] });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Delete failed"),
  });

  function startEdit(z: Zone) {
    setEditing(z);
    setName(z.name);
    setType((ZONE_TYPES.find((t) => t.value === z.type)?.value ?? "general") as ZoneType);
    setCapacity(z.total_capacity);
    setPrice(z.price_per_hour);
    setError("");
  }

  function cancelEdit() {
    setEditing(null);
    setName("");
    setType("general");
    setCapacity(20);
    setPrice(5);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (editing) update.mutate();
    else create.mutate();
  }

  return (
    <div className="dash-split">
      <div className="dash-panel">
        <div className="dash-chart__head">
          <h2>{editing ? `Edit ${editing.name}` : "Create zone"}</h2>
          <p>
            {editing
              ? "Update capacity carefully — cannot go below active reservations."
              : "Org admins attach the zone to their entitled org automatically."}
          </p>
        </div>
        <form className="dash-form" onSubmit={onSubmit}>
          <label>
            Name
            <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </label>
          <label>
            Type
            <select
              className="ui-input"
              value={type}
              onChange={(e) => setType(e.target.value as ZoneType)}
            >
              {ZONE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <div className="dash-form__row">
            <label>
              Capacity
              <Input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
              />
            </label>
            <label>
              $/hour
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </label>
          </div>
          {error ? <p className="auth-card__error">{error}</p> : null}
          <div className="dash-form__actions">
            <button
              type="submit"
              className="console-btn console-btn--primary console-btn--pill"
              disabled={create.isPending || update.isPending}
            >
              {editing
                ? update.isPending
                  ? "Saving…"
                  : "Save zone"
                : create.isPending
                  ? "Creating…"
                  : "Create zone"}
            </button>
            {editing ? (
              <button type="button" className="console-btn console-btn--ghost" onClick={cancelEdit}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="dash-panel">
        <div className="dash-chart__head">
          <h2>{title}</h2>
          <p>{zones.length} zone{zones.length === 1 ? "" : "s"}</p>
        </div>
        <ul className="dash-table">
          {zonesQuery.isLoading ? <li className="dash-table__row">Loading…</li> : null}
          {!zonesQuery.isLoading && zones.length === 0 ? (
            <li className="dash-table__row dash-table__row--empty">No zones yet — create one.</li>
          ) : null}
          {zones.map((z) => (
            <li key={z.id} className="dash-table__row dash-table__row--stack">
              <div className="dash-table__row-main">
                <div>
                  <strong>{z.name}</strong>
                  <p className="dash-table__meta">
                    {z.type.replace("_", " ")} · ${z.price_per_hour.toFixed(2)}/hr
                    {z.organization_id != null ? ` · org #${z.organization_id}` : ""}
                  </p>
                </div>
                <Badge tone={z.available_spots > 0 ? "success" : "muted"}>
                  {z.available_spots}/{z.total_capacity}
                </Badge>
              </div>
              <div className="dash-table__actions">
                <Link href={`/console?zone=${z.id}`} className="console-btn console-btn--ghost">
                  Console
                </Link>
                <button
                  type="button"
                  className="console-btn console-btn--ghost"
                  onClick={() => startEdit(z)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="console-btn console-btn--ghost"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (window.confirm(`Delete zone “${z.name}”?`)) remove.mutate(z.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
