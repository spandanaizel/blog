import { apiClient } from '@/lib/axios';
import type { ApiResponse, ActivityFeedItem, PaginationMeta } from '@/types';

export interface ActivityListParams {
  page?: number;
  limit?: number;
}

export const activityApi = {
  list: (params: ActivityListParams = {}) =>
    apiClient.get<ApiResponse<ActivityFeedItem[]>>('/activity', { params }).then((r) => ({
      items: r.data.data,
      meta: r.data.meta as PaginationMeta,
    })),
};
