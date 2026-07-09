import { useInfiniteQuery } from '@tanstack/react-query';
import { activityApi } from '@/api/activityApi';
import { useAuthStore } from '@/store/authStore';

export function useActivityFeed() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useInfiniteQuery({
    queryKey: ['activity'],
    queryFn: ({ pageParam }) => activityApi.list({ page: pageParam, limit: 15 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const isLastPage = lastPage.meta.page >= lastPage.meta.totalPages;
      return isLastPage ? undefined : lastPage.meta.page + 1;
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
}
