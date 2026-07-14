"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EntitlementBanner } from "@/components/dashboard/EntitlementBanner";
import { api, ApiError } from "@/lib/api/client";
import type { Organization, Zone } from "@/lib/api/types";
import { isEntitlementApiError, orgEntitlement } from "@/lib/org/entitlement";
import { toast } from "@/lib/toast";

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
  organization,
  entitlementGate = false,
}: {
  token: string | null;
  /** When set, only show zones for this org (org admin). */
  filterOrgId?: number | null;
  title?: string;
  /** Org used for entitlement banner (org admin surfaces). */
  organization?: Organization | null;
  /** When true, block create/edit until org is entitled. */
  entitlementGate?: boolean;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<ZoneType>("general");
  const [capacity, setCapacity] = useState(20);
  const [price, setPrice] = useState(5);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Zone | null>(null);

  const entitlement = useMemo(
    () =>
      entitlementGate
        ? orgEntitlement(organization)
        : { entitled: true, reason: null, title: "", body: "" },
    [entitlementGate, organization],
  );
  const locked = entitlementGate && !entitlement.entitled;

  const zonesQuery = useQuery({
    queryKey: ["admin-zones"],
    queryFn: () => api.zones(),
  });

  const zones = (zonesQuery.data ?? []).filter((z) => {
    if (filterOrgId == null) return true;
    return z.organization_id === filterOrgId;
  });

  function mapMutationError(e: unknown, fallback: string) {
    if (e instanceof ApiError) {
      if (isEntitlementApiError(e.message, e.errors)) {
        return e.errors.organization ? `${e.message}: ${e.errors.organization}` : e.message;
      }
      return e.message;
    }
    return fallback;
  }

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
      toast.success("Zone created");
    },
    onError: (e) => {
      const msg = mapMutationError(e, "Create failed");
      setError(msg);
      toast.error("Zone create failed", msg);
    },
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
      toast.success("Zone updated");
    },
    onError: (e) => {
      const msg = mapMutationError(e, "Update failed");
      setError(msg);
      toast.error("Zone update failed", msg);
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.deleteZone(token, id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-zones"] });
      toast.success("Zone deleted");
    },
    onError: (e) => {
      const msg = mapMutationError(e, "Delete failed");
      setError(msg);
      toast.error("Zone delete failed", msg);
    },
  });

  function startEdit(z: Zone) {
    if (locked) return;
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
    if (locked) {
      setError(entitlement.title || "Organization not entitled");
      return;
    }
    if (editing) update.mutate();
    else create.mutate();
  }

  return (
    <div className="dash-split">
      {entitlementGate ? <EntitlementBanner state={entitlement} /> : null}
      <div className="dash-panel">
        <div className="dash-chart__head">
          <h2>{editing ? `Edit ${editing.name}` : "Create zone"}</h2>
          <p>
            {locked
              ? "Create stays locked until the org is approved and subscribed."
              : editing
                ? "Update capacity carefully — cannot go below active reservations."
                : "Org admins attach the zone to their entitled org automatically."}
          </p>
        </div>
        <form className="dash-form" onSubmit={onSubmit}>
          <fieldset disabled={locked} className="dash-form__fieldset">
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
          </fieldset>
          {error ? <p className="auth-card__error">{error}</p> : null}
          <div className="dash-form__actions">
            <button
              type="submit"
              className="console-btn console-btn--primary console-btn--pill"
              disabled={locked || create.isPending || update.isPending}
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
          <Badge tone="muted">{zones.length} listed</Badge>
        </div>
        <ul className="dash-table">
          {zonesQuery.isLoading ? <li className="dash-table__row">Loading…</li> : null}
          {!zonesQuery.isLoading && zones.length === 0 ? (
            <li className="dash-table__row dash-table__row--empty">No zones yet.</li>
          ) : null}
          {zones.map((z) => (
            <li key={z.id} className="dash-table__row">
              <div>
                <strong>{z.name}</strong>
                <p className="dash-table__meta">
                  {z.type.replace("_", " ")} · {z.available_spots}/{z.total_capacity} free · $
                  {z.price_per_hour.toFixed(2)}/hr
                </p>
              </div>
              <div className="dash-table__actions">
                <button
                  type="button"
                  className="console-btn console-btn--ghost"
                  disabled={locked}
                  onClick={() => startEdit(z)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="console-btn console-btn--ghost"
                  disabled={locked || remove.isPending}
                  onClick={() => remove.mutate(z.id)}
                >
                  Delete
                </button>
                <Link href={`/zones/${z.id}`} className="console-btn console-btn--ghost">
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
