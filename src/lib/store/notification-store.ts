"use client";

import { create } from "zustand";
import type { Notification } from "@/lib/types";
import {
  getMyNotifications,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions/notification-actions";

interface NotificationState {
  items: Notification[];
  isOpen: boolean;
  loaded: boolean;
  toggle: () => void;
  close: () => void;
  load: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  isOpen: false,
  loaded: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  close: () => set({ isOpen: false }),
  load: async () => {
    const items = await getMyNotifications();
    set({ items, loaded: true });
  },
  markRead: async (id) => {
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    await markNotificationReadAction(id);
  },
  markAllRead: async () => {
    set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) }));
    await markAllNotificationsReadAction();
  },
  unreadCount: () => get().items.filter((n) => !n.read).length,
}));
