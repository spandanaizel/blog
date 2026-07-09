import { useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/api/postsApi';
import { usersApi } from '@/api/usersApi';

/** Returns an onMouseEnter-friendly handler that warms the query cache for a post's detail page. */
export function usePrefetchPost() {
  const queryClient = useQueryClient();

  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: ['posts', 'detail', slug],
      queryFn: () => postsApi.getBySlug(slug),
      staleTime: 30 * 1000,
    });
  };
}

/** Returns an onMouseEnter-friendly handler that warms the query cache for an author's profile page. */
export function usePrefetchAuthor() {
  const queryClient = useQueryClient();

  return (username: string) => {
    queryClient.prefetchQuery({
      queryKey: ['author', username],
      queryFn: () => usersApi.getByUsername(username),
      staleTime: 30 * 1000,
    });
  };
}
