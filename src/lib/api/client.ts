import type { ErrorEnvelope, SuccessEnvelope } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api/v1";

export class ApiError extends Error {
  status: number;
  errors: Record<string, string>;

  constructor(status: number, message: string, errors: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  demoReservation?: boolean;
};

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (opts.token) {
    headers.Authorization = `Bearer ${opts.token}`;
  }
  if (opts.demoReservation) {
    headers["X-Demo-Reservation"] = "true";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: "include",
  });

  const json = (await res.json()) as SuccessEnvelope<T> | ErrorEnvelope;

  if (!res.ok || !json.success) {
    const err = json as ErrorEnvelope;
    throw new ApiError(res.status, err.message ?? "Request failed", err.errors ?? {});
  }

  return (json as SuccessEnvelope<T>).data;
}

type PaginatedResult<T> = {
  items: T;
  total: number;
  page: number;
  limit: number;
};

async function apiRequestPaginated<T>(
  path: string,
  token: string,
): Promise<PaginatedResult<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
  const json = (await res.json()) as SuccessEnvelope<T> | ErrorEnvelope;
  if (!res.ok || !json.success) {
    const err = json as ErrorEnvelope;
    throw new ApiError(res.status, err.message ?? "Request failed", err.errors ?? {});
  }
  return {
    items: (json as SuccessEnvelope<T>).data,
    total: Number(res.headers.get("X-Total-Count") ?? 0),
    page: Number(res.headers.get("X-Page") ?? 1),
    limit: Number(res.headers.get("X-Limit") ?? 20),
  };
}

export const api = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: import("./types").User }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  me: (token: string) => apiRequest<import("./types").User>("/auth/me", { token }),
  zones: (params?: { q?: string; type?: string; sort?: string; order?: string }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.type) qs.set("type", params.type);
    if (params?.sort) qs.set("sort", params.sort);
    if (params?.order) qs.set("order", params.order);
    const query = qs.toString();
    return apiRequest<import("./types").Zone[]>(`/zones${query ? `?${query}` : ""}`);
  },
  zone: (id: number) => apiRequest<import("./types").Zone>(`/zones/${id}`),
  spots: (zoneId: number) => apiRequest<import("./types").Spot[]>(`/zones/${zoneId}/spots`),
  reserve: (
    token: string,
    body: { zone_id: number; license_plate: string; spot_id?: number },
    demo: boolean,
  ) =>
    apiRequest<import("./types").Reservation>("/reservations", {
      method: "POST",
      token,
      body,
      demoReservation: demo,
    }),
  myReservations: (token: string) =>
    apiRequest<import("./types").Reservation[]>("/reservations/my-reservations", { token }),
  cancelReservation: (token: string, id: number) =>
    apiRequest<null>(`/reservations/${id}`, { method: "DELETE", token }),
  updateSpotStatus: (token: string, zoneId: number, spotId: number, status: string) =>
    apiRequest<import("./types").Spot>(`/zones/${zoneId}/spots/${spotId}`, {
      method: "PUT",
      token,
      body: { status },
    }),
  allReservations: (token: string, page: number, limit: number) =>
    apiRequestPaginated<import("./types").Reservation[]>(
      `/reservations?page=${page}&limit=${limit}`,
      token,
    ),
};

export const DEMO_CREDENTIALS = {
  driver: { email: "alice@spotsync.com", password: "DriverPass123!" },
  demoAdmin: { email: "demo_admin@spotsync.com", password: "DemoAdminPass123!" },
  admin: { email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? "", password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD ?? "" },
};

export function demoPlate() {
  return `DEMO-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
