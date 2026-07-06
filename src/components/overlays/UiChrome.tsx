"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Spot } from "@/lib/api/types";

export function ZonePill({
  zoneName,
  free,
  total,
  stress,
}: {
  zoneName: string;
  free: number;
  total: number;
  stress?: boolean;
}) {
  return (
    <motion.div
      animate={stress ? { boxShadow: ["0 4px 14px rgba(126,200,227,0.2)", "0 4px 22px rgba(126,200,227,0.55)", "0 4px 14px rgba(126,200,227,0.2)"] } : {}}
      transition={{ duration: 1.4, repeat: stress ? Infinity : 0 }}
      className="rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-sm"
    >
      <p className="flex items-center gap-2 text-sm font-medium text-[#2D2A26]">
        <span className="h-2 w-2 rounded-full bg-[#6B9E6B]" aria-hidden />
        {zoneName}
      </p>
      <p className="mt-0.5 text-sm">
        <AnimatePresence mode="wait">
          <motion.span
            key={free}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="font-semibold text-[#7EC8E3]"
          >
            {free} spots free
          </motion.span>
        </AnimatePresence>
        <span className="text-[#999]"> · {total} total</span>
      </p>
      {stress && <p className="mt-1 text-xs font-medium text-[#C45C4A]">Last spot — reserve now</p>}
    </motion.div>
  );
}

export function SearchBar({
  value,
  onChange,
  onSignIn,
  signedIn,
}: {
  value: string;
  onChange: (v: string) => void;
  onSignIn?: () => void;
  signedIn?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex w-64 items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search zone..."
          className="w-full bg-transparent text-sm text-[#2D2A26] outline-none placeholder:text-[#AAA]"
        />
      </div>
      {!signedIn && onSignIn && (
        <button
          type="button"
          onClick={onSignIn}
          className="rounded-full bg-white/95 px-3 py-2 text-xs font-medium text-[#2D2A26] shadow-md"
        >
          Sign in
        </button>
      )}
    </div>
  );
}

export function Legend({ pulseKey }: { pulseKey: number }) {
  const items = [
    { color: "#6B9E6B", label: "Available" },
    { color: "#B8B5AD", label: "Occupied" },
  ];
  return (
    <motion.div
      key={pulseKey}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 0.3 }}
      className="flex gap-4 rounded-2xl bg-white/95 px-4 py-2 text-xs shadow-md backdrop-blur-sm"
    >
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-[#555]">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </motion.div>
  );
}

export function ReserveCard({
  spot,
  plate,
  onPlateChange,
  onReserve,
  onClose,
  loading,
  error,
  demoMode,
}: {
  spot: Spot;
  plate: string;
  onPlateChange: (v: string) => void;
  onReserve: () => void;
  onClose: () => void;
  loading?: boolean;
  error?: string;
  demoMode?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="w-64 rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur-sm"
    >
      <div className="mb-4 flex items-start justify-between">
        <p className="text-2xl font-bold text-[#7EC8E3]">{spot.label}</p>
        <button type="button" onClick={onClose} className="text-[#BBB] hover:text-[#666]" aria-label="Close">
          ×
        </button>
      </div>
      <label className="mb-1 block text-xs text-[#999]">License plate</label>
      <input
        value={plate}
        onChange={(e) => onPlateChange(e.target.value.toUpperCase())}
        placeholder="ABC-1234"
        maxLength={15}
        className="mb-3 w-full rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2.5 text-sm text-[#2D2A26] outline-none focus:border-[#7EC8E3]"
      />
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
      {demoMode && <p className="mb-2 text-xs text-[#7EC8E3]">Demo — auto-releases in 10 min</p>}
      <button
        type="button"
        disabled={loading || !plate.trim()}
        onClick={onReserve}
        className="w-full rounded-xl bg-[#7EC8E3] py-3 text-sm font-semibold text-white transition hover:bg-[#6ab8d4] disabled:opacity-50"
      >
        {loading ? "Reserving…" : "Reserve"}
      </button>
    </motion.div>
  );
}

export function Dock({
  onHome,
  onLocate,
  onNotifications,
  onToggleActivity,
  liveActivity,
}: {
  onHome: () => void;
  onLocate: () => void;
  onNotifications: () => void;
  onToggleActivity: () => void;
  liveActivity: boolean;
}) {
  return (
    <div className="relative flex items-end justify-center">
      <div className="flex items-center gap-10 rounded-full bg-white/95 px-10 py-2.5 shadow-lg backdrop-blur-sm">
        <motion.button
          whileHover={{ scale: 1.05 }}
          type="button"
          onClick={onHome}
          className="text-[#7EC8E3]"
          aria-label="Home"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12l9-9 9 9M5 10v10h14V10" />
          </svg>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          type="button"
          onClick={onNotifications}
          className="relative text-[#7EC8E3]"
          aria-label="Notifications"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
        </motion.button>
        <button
          type="button"
          onClick={onToggleActivity}
          className={`sr-only focus:not-sr-only ${liveActivity ? "text-[#2D6A7E]" : "text-[#999]"}`}
        >
          {liveActivity ? "Live traffic on" : "Live traffic off"}
        </button>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        type="button"
        onClick={onLocate}
        className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#7EC8E3] text-white shadow-xl"
        aria-label="Find available spot"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
        </svg>
      </motion.button>
    </div>
  );
}

export function SpotTooltip({ spot, x, y }: { spot: Spot; x: number; y: number }) {
  return (
    <div
      className="pointer-events-none absolute z-20 rounded-lg bg-[#2D2A26]/90 px-2.5 py-1.5 text-xs text-white shadow-lg"
      style={{ left: x, top: y }}
    >
      <span className="font-semibold">{spot.label}</span>
      <span className="text-white/70"> · {spot.occupied ? "Occupied" : spot.status === "available" ? "Available" : "Unavailable"}</span>
    </div>
  );
}
