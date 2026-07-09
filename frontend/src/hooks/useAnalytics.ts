import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analyticsApi';
import { useAuthStore } from '@/store/authStore';

export function useDashboardAnalytics() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.dashboard,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAdminAnalytics() {
  const role = useAuthStore((s) => s.user?.role);
  return useQuery({
    queryKey: ['analytics', 'admin'],
    queryFn: analyticsApi.admin,
    enabled: role === 'admin',
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useUserAnalytics(userId: string | undefined) {
  return useQuery({
    queryKey: ['analytics', 'user', userId],
    queryFn: () => analyticsApi.user(userId as string),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
