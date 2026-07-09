import { apiClient } from '@/lib/axios';
import type { ApiResponse, User, PublicUser, Post, PaginationMeta } from '@/types';

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  avatar?: string;
  socialLinks?: Partial<User['socialLinks']>;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UserPostsParams {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'all';
}

export const usersApi = {
  list: (params: UserListParams = {}) =>
    apiClient.get<ApiResponse<PublicUser[]>>('/users', { params }).then((r) => ({
      users: r.data.data,
      meta: r.data.meta as PaginationMeta,
    })),

  getByUsername: (username: string) =>
    apiClient.get<ApiResponse<{ user: PublicUser }>>(`/users/${username}`).then((r) => r.data.data.user),

  getMyProfile: () =>
    apiClient.get<ApiResponse<{ user: User }>>('/users/profile/me').then((r) => r.data.data.user),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.put<ApiResponse<{ user: User }>>('/users/profile', payload).then((r) => r.data.data.user),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.put<ApiResponse<null>>('/users/change-password', payload).then((r) => r.data),

  getUserPosts: (id: string, params: UserPostsParams = {}) =>
    apiClient.get<ApiResponse<Post[]>>(`/users/${id}/posts`, { params }).then((r) => ({
      posts: r.data.data,
      meta: r.data.meta as PaginationMeta,
    })),

  getFollowers: (id: string, params: { page?: number; limit?: number } = {}) =>
    apiClient.get<ApiResponse<PublicUser[]>>(`/users/${id}/followers`, { params }).then((r) => ({
      users: r.data.data,
      meta: r.data.meta as PaginationMeta,
    })),

  getFollowing: (id: string, params: { page?: number; limit?: number } = {}) =>
    apiClient.get<ApiResponse<PublicUser[]>>(`/users/${id}/following`, { params }).then((r) => ({
      users: r.data.data,
      meta: r.data.meta as PaginationMeta,
    })),
};
