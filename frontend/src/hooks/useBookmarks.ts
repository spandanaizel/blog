import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookmarksApi, followApi } from '@/api/bookmarksApi';
import { toast } from '@/hooks/useToast';

export function useBookmarks() {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: bookmarksApi.list,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, bookmarked }: { postId: string; bookmarked: boolean }) =>
      bookmarked ? bookmarksApi.remove(postId) : bookmarksApi.add(postId).then(() => ({ success: true, message: 'Bookmarked', data: null })),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast({ title: variables.bookmarked ? 'Bookmark removed' : 'Saved to bookmarks' });
    },
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, following }: { userId: string; following: boolean; username?: string }) =>
      following ? followApi.unfollow(userId) : followApi.follow(userId),
    onSuccess: (_data, variables) => {
      // 'author' is cached by username, not id, so invalidate by query-key prefix rather
      // than trying to reconstruct the exact key — this also covers the directory,
      // followers, and following lists which can all show a stale follow state.
      queryClient.invalidateQueries({ queryKey: ['author'] });
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      toast({ title: variables.following ? 'Unfollowed' : 'Following' });
    },
  });
}
