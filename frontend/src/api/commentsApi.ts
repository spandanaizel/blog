import { apiClient } from '@/lib/axios';
import type { ApiResponse, Comment } from '@/types';

export const commentsApi = {
  listForPost: (postId: string) =>
    apiClient.get<ApiResponse<Comment[]>>(`/comments/${postId}`).then((r) => r.data.data),

  create: (payload: { post: string; content: string; parentComment?: string | null }) =>
    apiClient.post<ApiResponse<Comment>>('/comments', payload).then((r) => r.data.data),

  update: (id: string, content: string) =>
    apiClient.put<ApiResponse<Comment>>(`/comments/${id}`, { content }).then((r) => r.data.data),

  remove: (id: string) => apiClient.delete<ApiResponse<null>>(`/comments/${id}`).then((r) => r.data),

  like: (id: string) =>
    apiClient.post<ApiResponse<{ likesCount: number; liked: boolean }>>(`/comments/${id}/like`).then((r) => r.data.data),
};
