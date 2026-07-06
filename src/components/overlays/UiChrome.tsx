"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Spot } from "@/lib/api/types";

export function ZonePill({
  zoneName,
  free,
  total,
}: {
  zoneName: string;
  free: number;
  total: number;
}) {
  return (
    <div className="rounded-2xl bg-white/92 px-4 py-2 shadow-lg backdrop-blur-sm">
      <p className="text-sm font-semibold text-[#2D2A26]">{zoneName}</p>
      <p className="text-xs text-[#666]">
        <AnimatePresence mode="wait">
          <motion.span
            key={free}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="font-medium text-[#2D6A7E]"
          >
            {free} spots free
          </motion.span>
        </AnimatePresence>
        <span className="text-[#999]"> · {total} total</span>
      </p>
    </div>
  );
}

export function Legend({ pulseKey }: { pulseKey: number }) {
  const items = [
    { color: "bg-emerald-400", label: "Available" },
    { color: "bg-stone-400", label: "Occupied" },
    { color: "bg-stone-200", label: "Unavailable" },
  ];
  return (
    <motion.div
      key={pulseKey}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 rounded-full bg-white/92 px-3 py-1.5 text-xs shadow-md backdrop-blur-sm"
    >
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1 text-[#555]">
          <span className={`h-2 w-2 rounded-full ${item.color}`} />
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
      className="w-72 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-sm"
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#888]">Reserve</p>
          <p className="text-lg font-semibold text-[#2D2A26]">{spot.label}</p>
        </div>
        <button type="button" onClick={onClose} className="text-[#999] hover:text-[#333]" aria-label="Close">
          ×
        </button>
      </div>
      <input
        value={plate}
        onChange={(e) => onPlateChange(e.target.value.toUpperCase())}
        placeholder="License plate"
        maxLength={15}
        className="mb-3 w-full border-b border-[#ddd] bg-transparent py-2 text-sm outline-none focus:border-[#7EC8E3]"
      />
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
      {demoMode && <p className="mb-2 text-xs text-[#2D6A7E]">Auto-releases in 10 min</p>}
      <button
        type="button"
        disabled={loading || !plate.trim()}
        onClick={onReserve}
        className="w-full rounded-full bg-[#7EC8E3] py-2.5 text-sm font-semibold text-white transition hover:bg-[#6ab8d4] disabled:opacity-50"
      >
        {loading ? "Reserving…" : "Reserve spot"}
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
  isAdmin,
  onManage,
}: {
  onHome: () => void;
  onLocate: () => void;
  onNotifications: () => void;
  onToggleActivity: () => void;
  liveActivity: boolean;
  isAdmin?: boolean;
  onManage?: () => void;
}) {
  return (
    <div className="flex items-center gap-6 rounded-full border-t-2 border-[#7EC8E3]/40 bg-white/95 px-8 py-2 shadow-lg backdrop-blur-sm">
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
        onClick={onLocate}
        className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#7EC8E3] text-white shadow-lg"
        aria-label="Find spot"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
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
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
      </motion.button>
      {isAdmin && (
        <motion.button whileHover={{ scale: 1.05 }} type="button" onClick={onManage} className="text-xs text-[#666]">
          Manage
        </motion.button>
      )}
      <motion.button
        whileHover={{ scale: 1.05 }}
        type="button"
        onClick={onToggleActivity}
        className={`text-xs ${liveActivity ? "text-[#2D6A7E] font-medium" : "text-[#999]"}`}
      >
        {liveActivity ? "Live ●" : "Live ○"}
      </motion.button>
    </div>
  );
}
