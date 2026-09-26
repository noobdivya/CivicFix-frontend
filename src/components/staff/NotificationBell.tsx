"use client";

import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { issuePath, notificationApi, type Notification, type Role } from "@/lib/staff-api";
import { timeAgo } from "@/lib/status";

/**
 * Bell with unread count. Notifications are fetched with a normal API
 * request when the page loads, when the bell is opened, and on Refresh.
 */
export function NotificationBell({ role }: { role: Role }) {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    notificationApi
      .list()
      .then((r) => {
        setItems(r.items);
        setUnread(r.unread);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load once when the page opens.
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const toggle = () => {
    if (!open) load(); // fetch the latest when the user opens the bell
    setOpen((o) => !o);
  };

  const openItem = (n: Notification) => {
    if (!n.readAt) {
      notificationApi.read([n.id]).catch(() => {});
      setItems((list) => list.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
      setUnread((u) => Math.max(0, u - 1));
    }
    setOpen(false);
    if (n.issueId) router.push(issuePath(role, n.issueId));
  };

  const markAll = () => {
    notificationApi.read("all").catch(() => {});
    setItems((list) => list.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() })));
    setUnread(0);
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-card-2 hover:text-fg"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-[1200] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-card shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
            <p className="text-sm font-semibold text-fg">Notifications</p>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <button onClick={markAll} className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                  <CheckCheck className="size-3.5" /> Mark all read
                </button>
              )}
              <button onClick={load} disabled={loading} className="rounded p-1 text-muted hover:bg-card-2 hover:text-fg" aria-label="Refresh notifications">
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              </button>
            </div>
          </div>
          <ul className="max-h-96 divide-y divide-line overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-subtle">No notifications yet.</li>}
            {items.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => openItem(n)}
                  className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-card-2 ${n.readAt ? "" : "bg-blue-500/5"}`}
                >
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-blue-500"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-fg">{n.title}</span>
                    {n.body && <span className="block truncate text-xs text-muted">{n.body}</span>}
                    <span className="block text-[11px] text-subtle">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
