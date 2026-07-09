import { apiClient } from '@/lib/axios';
import type { ApiResponse, AppNotification, NotificationListMeta } from '@/types';

export interface NotificationListParams {
  page?: number;
  limit?: number;
}

export const notificationsApi = {
  list: (params: NotificationListParams = {}) =>
    apiClient.get<ApiResponse<AppNotification[]>>('/notifications', { params }).then((r) => ({
      notifications: r.data.data,
      meta: r.data.meta as unknown as NotificationListMeta,
    })),

  markRead: (id: string) =>
    apiClient.patch<ApiResponse<AppNotification>>(`/notifications/${id}/read`).then((r) => r.data.data),

  markAllRead: () => apiClient.patch<ApiResponse<null>>('/notifications/read-all').then((r) => r.data),
};
