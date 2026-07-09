import { create } from 'zustand';
import type { AppNotification } from '@/types';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  hasLoadedInitial: boolean;
  setNotifications: (list: AppNotification[], unreadCount?: number) => void;
  appendNotifications: (list: AppNotification[]) => void;
  addNotification: (n: AppNotification) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  hasLoadedInitial: false,
  setNotifications: (list, unreadCount) =>
    set({
      notifications: list,
      unreadCount: unreadCount ?? list.filter((n) => !n.isRead).length,
      hasLoadedInitial: true,
    }),
  appendNotifications: (list) =>
    set({ notifications: [...get().notifications, ...list] }),
  addNotification: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
  markRead: (id) =>
    set((state) => {
      const target = state.notifications.find((n) => n._id === id);
      if (!target || target.isRead) return state;
      return {
        notifications: state.notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }),
}));
