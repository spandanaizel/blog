import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/useToast';
import { disconnectSocket } from '@/sockets/socketClient';

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const user = await authApi.me();
      setAuth(user, accessToken || '');
      return user;
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      queryClient.invalidateQueries();
      toast({ title: 'Welcome back', description: `Signed in as ${data.user.name}`, variant: 'success' });
      navigate('/');
    },
    onError: (err: any) => {
      toast({
        title: 'Could not sign in',
        description: err?.response?.data?.message || 'Check your credentials and try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast({ title: 'Account created', description: `Welcome to Inkwell, ${data.user.name}!`, variant: 'success' });
      navigate('/');
    },
    onError: (err: any) => {
      toast({
        title: 'Registration failed',
        description: err?.response?.data?.message || 'Please review the form and try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      disconnectSocket();
      queryClient.clear();
      navigate('/login');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast({ title: 'Check your email', description: 'If that address exists, a reset link is on its way.' });
    },
    onError: () => {
      toast({ title: 'Something went wrong', description: 'Please try again in a moment.', variant: 'destructive' });
    },
  });
}

export function useResetPassword() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast({ title: 'Password reset', description: 'You can now log in with your new password.', variant: 'success' });
      navigate('/login');
    },
    onError: (err: any) => {
      toast({
        title: 'Reset failed',
        description: err?.response?.data?.message || 'That link may have expired.',
        variant: 'destructive',
      });
    },
  });
}
