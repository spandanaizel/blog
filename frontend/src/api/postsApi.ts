import { apiClient } from '@/lib/axios';
import type { ApiResponse, Post, PaginationMeta } from '@/types';

export interface PostQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  author?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'popular' | 'mostLiked';
  status?: 'draft' | 'published';
}

export interface CreatePostPayload {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  coverImagePublicId?: string | null;
  tags?: string[];
  category?: string;
  status?: 'draft' | 'published';
}

export const postsApi = {
  list: (params: PostQueryParams = {}) =>
    apiClient
      .get<ApiResponse<Post[]>>('/posts', { params })
      .then((r) => ({ posts: r.data.data, meta: r.data.meta as PaginationMeta })),

  getBySlug: (slug: string) =>
    apiClient
      .get<ApiResponse<{ post: Post; relatedPosts: Post[] }>>(`/posts/${slug}`)
      .then((r) => r.data.data),

  create: (payload: CreatePostPayload) =>
    apiClient.post<ApiResponse<Post>>('/posts', payload).then((r) => r.data.data),

  update: (id: string, payload: Partial<CreatePostPayload>) =>
    apiClient.put<ApiResponse<Post>>(`/posts/${id}`, payload).then((r) => r.data.data),

  remove: (id: string) => apiClient.delete<ApiResponse<null>>(`/posts/${id}`).then((r) => r.data),

  like: (id: string) => apiClient.post<ApiResponse<{ likesCount: number }>>(`/posts/${id}/like`).then((r) => r.data.data),

  unlike: (id: string) =>
    apiClient.delete<ApiResponse<{ likesCount: number }>>(`/posts/${id}/like`).then((r) => r.data.data),
};
