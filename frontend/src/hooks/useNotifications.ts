import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notificationsApi';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';

/**
 * Loads the first page of notifications from the REST API once on login and
 * syncs them into the notification store. From then on, new notifications
 * arrive in real time over Socket.IO (see useSocketConnection) and are
 * pushed into the same store, so the dropdown and the full page never go
 * out of sync with each other.
 */
export function useNotificationsBootstrap() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasLoadedInitial = useNotificationStore((s) => s.hasLoadedInitial);
  const setNotifications = useNotificationStore((s) => s.setNotifications);

  const { data } = useQuery({
    queryKey: ['notifications', 'initial'],
    queryFn: () => notificationsApi.list({ page: 1, limit: 20 }),
    enabled: isAuthenticated && !hasLoadedInitial,
  });

  useEffect(() => {
    if (data) {
      setNotifications(data.notifications, data.meta.unreadCount);
    }
  }, [data, setNotifications]);
}

/** Paginated notifications list for the full Notifications page, with a "load more" affordance. */
export function useNotificationsPage() {
  const [page, setPage] = useState(1);
  const appendNotifications = useNotificationStore((s) => s.appendNotifications);
  const hasLoadedInitial = useNotificationStore((s) => s.hasLoadedInitial);

  const query = useQuery({
    queryKey: ['notifications', 'page', page],
    queryFn: () => notificationsApi.list({ page, limit: 20 }),
    enabled: hasLoadedInitial && page > 1,
  });

  useEffect(() => {
    if (query.data && page > 1) {
      appendNotifications(query.data.notifications);
    }
  }, [query.data, page, appendNotifications]);

  return {
    loadMore: () => setPage((p) => p + 1),
    hasMore: query.data ? page < query.data.meta.totalPages : true,
    isLoadingMore: query.isFetching,
  };
}

export function useMarkNotificationRead() {
  const markRead = useNotificationStore((s) => s.markRead);
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: (_data, id) => markRead(id),
  });
}

export function useMarkAllNotificationsRead() {
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      markAllRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
