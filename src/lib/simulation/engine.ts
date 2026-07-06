import type { Spot } from "@/lib/api/types";
import { pathForSpot, randomGhostColor } from "./paths";

export type GhostCar = {
  id: string;
  spotId: number;
  color: string;
  path: { x: number; y: number }[];
};

type EngineOptions = {
  enabled: boolean;
  maxConcurrent?: number;
  minIntervalMs?: number;
  maxIntervalMs?: number;
  ghostLifetimeMs?: number;
  onSpawn: (ghost: GhostCar) => void;
  onRemove: (id: string) => void;
  getAvailableSpots: () => Spot[];
};

export class SimulationEngine {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private ghosts = new Map<string, { spotId: number; timeout: ReturnType<typeof setTimeout> }>();
  private opts: EngineOptions;

  constructor(opts: EngineOptions) {
    this.opts = {
      maxConcurrent: 3,
      minIntervalMs: 8000,
      maxIntervalMs: 15000,
      ghostLifetimeMs: 30000,
      ...opts,
    };
  }

  start() {
    this.stop();
    if (!this.opts.enabled) return;
    this.scheduleNext();
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  clear() {
    for (const [, g] of this.ghosts) {
      clearTimeout(g.timeout);
    }
    this.ghosts.clear();
  }

  removeGhost(id: string) {
    const g = this.ghosts.get(id);
    if (g) {
      clearTimeout(g.timeout);
      this.ghosts.delete(id);
    }
    this.opts.onRemove(id);
  }

  getGhostSpotIds(): Set<number> {
    return this.ghostsSpotIds();
  }

  private ghostsSpotIds(): Set<number> {
    return new Set([...this.ghosts.values()].map((g) => g.spotId));
  }

  private scheduleNext() {
    const { minIntervalMs = 8000, maxIntervalMs = 15000 } = this.opts;
    const delay = minIntervalMs + Math.random() * (maxIntervalMs - minIntervalMs);
    this.timer = setTimeout(() => {
      this.trySpawn();
      this.scheduleNext();
    }, delay);
  }

  private trySpawn() {
    const max = this.opts.maxConcurrent ?? 3;
    if (this.ghosts.size >= max) return;

    const candidates = this.opts
      .getAvailableSpots()
      .filter((s) => s.status === "available" && !s.occupied && !this.ghostsSpotIds().has(s.id));

    if (candidates.length === 0) return;

    const spot = candidates[Math.floor(Math.random() * candidates.length)];
    const id = `ghost-${Date.now()}-${spot.id}`;
    const ghost: GhostCar = {
      id,
      spotId: spot.id,
      color: randomGhostColor(),
      path: pathForSpot(spot),
    };

    this.ghosts.set(id, {
      spotId: spot.id,
      timeout: setTimeout(() => this.removeGhost(id), this.opts.ghostLifetimeMs ?? 30000),
    });
    this.opts.onSpawn(ghost);
  }
}
