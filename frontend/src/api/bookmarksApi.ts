import { apiClient } from '@/lib/axios';
import type { ApiResponse, Bookmark } from '@/types';

export const bookmarksApi = {
  list: () => apiClient.get<ApiResponse<Bookmark[]>>('/bookmarks').then((r) => r.data.data),
  add: (postId: string) => apiClient.post<ApiResponse<Bookmark>>('/bookmarks', { postId }).then((r) => r.data.data),
  remove: (postId: string) => apiClient.delete<ApiResponse<null>>(`/bookmarks/${postId}`).then((r) => r.data),
};

export const followApi = {
  follow: (userId: string) => apiClient.post<ApiResponse<null>>(`/follow/${userId}`).then((r) => r.data),
  unfollow: (userId: string) => apiClient.delete<ApiResponse<null>>(`/follow/${userId}`).then((r) => r.data),
};
