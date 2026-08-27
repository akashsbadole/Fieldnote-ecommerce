"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import { useNotificationStore } from "@/lib/store/notification-store";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const { items, isOpen, toggle, close, load, markRead, markAllRead, unreadCount } =
    useNotificationStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user?.id) load();
  }, [session?.user?.id, load]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [close]);

  if (!session) return null;
  const unread = unreadCount();

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
        className="relative cursor-pointer text-ink-soft hover:text-forest"
        onClick={toggle}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rust font-mono text-[0.6rem] text-paper">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 border border-line bg-paper shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="cursor-pointer font-mono text-xs text-forest hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center font-mono text-xs text-muted">
                Nothing yet.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {items.map((n) => {
                  const content = (
                    <div
                      className={`px-4 py-3 ${!n.read ? "bg-sand-light/40" : ""} hover:bg-paper-dim`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-body text-sm text-ink">{n.title}</p>
                        {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rust" />}
                      </div>
                      <p className="mt-0.5 font-body text-xs text-ink-soft">{n.message}</p>
                      <p className="mt-1 font-mono text-[0.65rem] text-muted">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  );
                  return (
                    <li key={n.id}>
                      {n.link ? (
                        <Link href={n.link} onClick={() => markRead(n.id)}>
                          {content}
                        </Link>
                      ) : (
                        <button
                          onClick={() => markRead(n.id)}
                          className="w-full cursor-pointer text-left"
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
