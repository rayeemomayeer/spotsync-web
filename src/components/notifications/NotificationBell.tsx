"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api/client";
import { getToken } from "@/lib/auth/session";
import type { AppNotification } from "@/lib/api/types";

export function NotificationBell() {
  const { user } = useAuth();
  const token = getToken();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.notifications(token ?? ""),
    enabled: !!user && !!token,
    refetchInterval: 30_000,
  });

  const markRead = useMutation({
    mutationFn: (id: number) => api.markNotificationRead(token ?? "", id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  if (!user) return null;

  const items = query.data ?? [];
  const unread = items.filter((n) => !n.read_at).length;

  return (
    <div className="notification-bell">
      <button
        type="button"
        className="console-btn console-btn--ghost notification-bell__trigger"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        🔔
        {unread > 0 ? <span className="notification-bell__badge">{unread}</span> : null}
      </button>
      {open ? (
        <div className="notification-bell__panel" role="dialog" aria-label="Notifications">
          <h2>Notifications</h2>
          {query.isLoading ? <p>Loading…</p> : null}
          <ul className="notification-bell__list">
            {items.length === 0 && !query.isLoading ? (
              <li>No notifications yet.</li>
            ) : (
              items.map((n) => (
                <NotificationRow
                  key={n.id}
                  item={n}
                  onRead={() => markRead.mutate(n.id)}
                />
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function NotificationRow({
  item,
  onRead,
}: {
  item: AppNotification;
  onRead: () => void;
}) {
  return (
    <li className={item.read_at ? "notification-bell__item" : "notification-bell__item notification-bell__item--unread"}>
      <strong>{item.title}</strong>
      <p>{item.body}</p>
      {!item.read_at ? (
        <button type="button" className="console-btn console-btn--ghost" onClick={onRead}>
          Mark read
        </button>
      ) : null}
    </li>
  );
}
