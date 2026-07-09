import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // data considered fresh for 30s before a background refetch
      gcTime: 5 * 60 * 1000, // unused query data is garbage-collected from cache after 5 minutes
    },
    mutations: {
      retry: 0,
    },
  },
});
