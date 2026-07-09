import { apiClient } from '@/lib/axios';
import type { ApiResponse, User } from '@/types';

export const adminApi = {
  updateUserRole: (userId: string, role: 'user' | 'admin') =>
    apiClient
      .patch<ApiResponse<{ user: User }>>(`/admin/users/${userId}/role`, { role })
      .then((r) => r.data.data.user),
};
