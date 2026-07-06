export type User = {
  id: number;
  name: string;
  email: string;
  role: "driver" | "admin" | "demo_admin";
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
  created_at: string;
  updated_at: string;
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

export type Reservation = {
  id: number;
  user_id: number;
  zone_id: number;
  spot_id?: number;
  license_plate: string;
  status: string;
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
