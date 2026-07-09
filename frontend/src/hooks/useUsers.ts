import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UserListParams, type UserPostsParams } from '@/api/usersApi';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/useToast';

export function useAuthors(params: UserListParams = {}) {
  return useQuery({
    queryKey: ['authors', params],
    queryFn: () => usersApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useAuthorProfile(username: string | undefined) {
  return useQuery({
    queryKey: ['author', username],
    queryFn: () => usersApi.getByUsername(username as string),
    enabled: Boolean(username),
  });
}

export function useMyProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersApi.getMyProfile,
    enabled: isAuthenticated,
  });
}

export function useUserPosts(userId: string | undefined, params: UserPostsParams = {}) {
  return useQuery({
    queryKey: ['userPosts', userId, params],
    queryFn: () => usersApi.getUserPosts(userId as string, params),
    enabled: Boolean(userId),
    placeholderData: (prev) => prev,
  });
}

export function useFollowers(userId: string | undefined, page = 1) {
  return useQuery({
    queryKey: ['followers', userId, page],
    queryFn: () => usersApi.getFollowers(userId as string, { page, limit: 20 }),
    enabled: Boolean(userId),
    placeholderData: (prev) => prev,
  });
}

export function useFollowing(userId: string | undefined, page = 1) {
  return useQuery({
    queryKey: ['following', userId, page],
    queryFn: () => usersApi.getFollowing(userId as string, { page, limit: 20 }),
    enabled: Boolean(userId),
    placeholderData: (prev) => prev,
  });
}

export function useUpdateProfile() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: (user) => {
      updateUser(user);
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['author', user.username] });
      toast({ title: 'Profile updated', variant: 'success' });
    },
    onError: (err: any) => {
      toast({ title: 'Could not update profile', description: err?.response?.data?.message, variant: 'destructive' });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: usersApi.changePassword,
    onSuccess: () => toast({ title: 'Password changed', variant: 'success' }),
    onError: (err: any) => {
      toast({ title: 'Could not change password', description: err?.response?.data?.message, variant: 'destructive' });
    },
  });
}
