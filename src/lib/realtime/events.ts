export type ZoneEventType = "spot_reserved" | "spot_released" | "spot_expired";

export type ZoneEvent = {
  type: ZoneEventType;
  zone_id: number;
  spot_id: number;
  user_id: number;
  reservation_id: number;
  license_plate?: string;
};
