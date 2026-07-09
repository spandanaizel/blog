import { apiClient } from '@/lib/axios';
import type { ApiResponse, User } from '@/types';

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  register: (payload: { name: string; username: string; email: string; password: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload).then((r) => r.data.data),

  login: (payload: { email: string; password: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload).then((r) => r.data.data),

  logout: () => apiClient.post<ApiResponse<null>>('/auth/logout').then((r) => r.data),

  me: () => apiClient.get<ApiResponse<{ user: User }>>('/auth/me').then((r) => r.data.data.user),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<{ resetToken?: string } | null>>('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (payload: { token: string; password: string }) =>
    apiClient.post<ApiResponse<null>>('/auth/reset-password', payload).then((r) => r.data),
};
