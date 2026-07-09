import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postsApi, type PostQueryParams, type CreatePostPayload } from '@/api/postsApi';
import { toast } from '@/hooks/useToast';

export function usePosts(params: PostQueryParams) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => postsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function usePost(slug: string | undefined) {
  return useQuery({
    queryKey: ['posts', 'detail', slug],
    queryFn: () => postsApi.getBySlug(slug as string),
    enabled: Boolean(slug),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => postsApi.create(payload),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: post.status === 'published' ? 'Post published' : 'Draft saved',
        description: post.status === 'published' ? 'Your post is now live.' : 'You can keep editing any time.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toast({ title: 'Could not save post', description: err?.response?.data?.message, variant: 'destructive' });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreatePostPayload> }) =>
      postsApi.update(id, payload),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: post.status === 'published' ? 'Post published' : 'Changes saved',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toast({ title: 'Could not update post', description: err?.response?.data?.message, variant: 'destructive' });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({ title: 'Post deleted' });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean; slug?: string }) =>
      liked ? postsApi.unlike(id) : postsApi.like(id),

    onMutate: async ({ id, liked, slug }) => {
      if (!slug) return undefined;

      const queryKey = ['posts', 'detail', slug];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<{ post: any; relatedPosts: any[] }>(queryKey);

      if (previous?.post && previous.post._id === id) {
        const delta = liked ? -1 : 1;
        queryClient.setQueryData(queryKey, {
          ...previous,
          post: {
            ...previous.post,
            likesCount: Math.max(0, (previous.post.likesCount ?? 0) + delta),
          },
        });
      }

      return { previous, queryKey };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (variables.slug) {
        queryClient.invalidateQueries({ queryKey: ['posts', 'detail', variables.slug] });
      }
    },
  });
}
