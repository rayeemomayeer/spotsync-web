"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { subscribeToasts, type ToastItem } from "@/lib/toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToasts((toast) => {
      setItems((prev) => [...prev.slice(-4), toast]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.durationMs);
    });
  }, []);

  function dismiss(id: string) {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <>
      {children}
      <div className="app-toast-host" aria-live="polite" aria-relevant="additions">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              className={`app-toast app-toast--${t.tone}`}
              role="status"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
              <div className="app-toast__body">
                <strong className="app-toast__title">{t.title}</strong>
                {t.description ? <p className="app-toast__desc">{t.description}</p> : null}
              </div>
              <button
                type="button"
                className="app-toast__close"
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
