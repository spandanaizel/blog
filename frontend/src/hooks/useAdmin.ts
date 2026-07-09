import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import type { PublicUser } from '@/types';
import { toast } from '@/hooks/useToast';

interface AuthorsQueryData {
  users: PublicUser[];
  meta: unknown;
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'user' | 'admin' }) =>
      adminApi.updateUserRole(userId, role),

    onMutate: async ({ userId, role }) => {
      await queryClient.cancelQueries({ queryKey: ['authors'] });

      // Snapshot every currently-cached "authors" list (one per page/search combo)
      // so we can roll every one of them back together if the request fails.
      const previousQueries = queryClient.getQueriesData<AuthorsQueryData>({ queryKey: ['authors'] });

      previousQueries.forEach(([queryKey, data]) => {
        if (!data) return;
        queryClient.setQueryData<AuthorsQueryData>(queryKey, {
          ...data,
          users: data.users.map((u) => (u.id === userId ? { ...u, role } : u)),
        });
      });

      return { previousQueries };
    },

    onError: (err: any, _vars, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast({
        title: 'Could not update role',
        description: err?.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    },

    onSuccess: (_user, { role }) => {
      toast({ title: `Role updated to ${role}`, variant: 'success' });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
  });
}
