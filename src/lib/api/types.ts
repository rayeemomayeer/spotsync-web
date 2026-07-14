export type UserRole = "driver" | "admin" | "saas_admin" | "org_admin";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Zone = {
  id: number;
  name: string;
  type: string;
  total_capacity: number;
  price_per_hour: number;
  available_spots: number;
  organization_id?: number;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: number;
  name: string;
  slug: string;
  status: "active" | "suspended" | string;
  billing_plan?: string | null;
  stripe_customer_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type OrgMember = {
  user_id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
};

export type AuditLog = {
  id: number;
  actor_user_id?: number;
  organization_id?: number;
  action: string;
  resource_type: string;
  resource_id?: number;
  created_at: string;
};

export type Spot = {
  id: number;
  zone_id: number;
  label: string;
  pos_x: number;
  pos_y: number;
  status: "available" | "unavailable";
  occupied: boolean;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: number;
  reservation_id?: number | null;
  user_id: number;
  zone_id: number;
  stripe_payment_intent_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Reservation = {
  id: number;
  user_id: number;
  zone_id: number;
  spot_id?: number;
  license_plate: string;
  status: string;
  payment_status?: string | null;
  payment_id?: number | null;
  created_at: string;
  updated_at: string;
  zone?: Zone;
  spot?: Spot;
};

export type SuccessEnvelope<T> = {
  success: true;
  message: string;
  data: T;
};

export type ErrorEnvelope = {
  success: false;
  message: string;
  errors: Record<string, string>;
};

export type LoginData = {
  token: string;
  user: User;
};
