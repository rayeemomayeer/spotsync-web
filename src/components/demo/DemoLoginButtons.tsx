"use client";

import { motion } from "framer-motion";

export function DemoLoginButtons({
  onDriver,
  onAdmin,
  loading,
}: {
  onDriver: () => void;
  onAdmin: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        disabled={loading}
        onClick={onDriver}
        className="rounded-full bg-[#7EC8E3] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6ab8d4] disabled:opacity-50"
      >
        Demo Driver
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={onAdmin}
        className="rounded-full border border-[#7EC8E3] px-4 py-2 text-sm font-medium text-[#2D2A26] transition hover:bg-[#7EC8E3]/10 disabled:opacity-50"
      >
        Demo Admin
      </button>
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="rounded-full bg-[#7EC8E3]/20 px-2 py-0.5 text-xs font-medium text-[#2D6A7E]">
      Demo session
    </span>
  );
}
