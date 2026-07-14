type ToastTone = "success" | "error" | "info";

export type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
};

export type ToastItem = ToastInput & {
  id: string;
  tone: ToastTone;
  durationMs: number;
};

type Listener = (toast: ToastItem) => void;

const listeners = new Set<Listener>();

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function push(input: ToastInput) {
  const toast: ToastItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    description: input.description,
    tone: input.tone ?? "info",
    durationMs: input.durationMs ?? (input.tone === "error" ? 5200 : 3400),
  };
  listeners.forEach((l) => l(toast));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("spotsync:toast", { detail: toast }));
  }
  return toast.id;
}

/** Imperative instant notifications for completed actions. */
export const toast = {
  success(title: string, description?: string) {
    return push({ title, description, tone: "success" });
  },
  error(title: string, description?: string) {
    return push({ title, description, tone: "error" });
  },
  info(title: string, description?: string) {
    return push({ title, description, tone: "info" });
  },
};
