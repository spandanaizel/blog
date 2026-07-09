import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/api/commentsApi';
import { getSocket, joinPostRoom, leavePostRoom } from '@/sockets/socketClient';
import type { Comment } from '@/types';
import { toast } from '@/hooks/useToast';

export function useComments(postId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['comments', postId];

  const query = useQuery({
    queryKey,
    queryFn: () => commentsApi.listForPost(postId as string),
    enabled: Boolean(postId),
  });

  useEffect(() => {
    if (!postId) return;

    joinPostRoom(postId);
    const socket = getSocket();

    const refresh = () => queryClient.invalidateQueries({ queryKey });

    socket?.on('comment:new', refresh);
    socket?.on('comment:updated', refresh);
    socket?.on('comment:deleted', refresh);
    socket?.on('comment:likeUpdated', refresh);

    return () => {
      leavePostRoom(postId);
      socket?.off('comment:new', refresh);
      socket?.off('comment:updated', refresh);
      socket?.off('comment:deleted', refresh);
      socket?.off('comment:likeUpdated', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  return query;
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { content: string; parentComment?: string | null }) =>
      commentsApi.create({ post: postId, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: () => {
      toast({ title: 'Could not post comment', variant: 'destructive' });
    },
  });
}

export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => commentsApi.update(id, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  });
}

export function useLikeComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentsApi.like(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  });
}

export type { Comment };
