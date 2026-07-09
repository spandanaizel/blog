import { apiClient } from '@/lib/axios';
import type { ApiResponse, DashboardStats, AdminStats } from '@/types';

export const analyticsApi = {
  dashboard: () => apiClient.get<ApiResponse<DashboardStats>>('/analytics/dashboard').then((r) => r.data.data),
  admin: () => apiClient.get<ApiResponse<AdminStats>>('/analytics/admin').then((r) => r.data.data),
  user: (id: string) => apiClient.get<ApiResponse<DashboardStats>>(`/analytics/user/${id}`).then((r) => r.data.data),
};
