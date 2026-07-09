import { useEffect, useState } from 'react';
import axios from 'axios';
import { config } from '@/config/env';
import { authApi } from '@/api/authApi';
import { useAuthStore, authStoreApi } from '@/store/authStore';

export function useAuthBootstrap() {
  const [ready, setReady] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const wasAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (!wasAuthenticated) {
        setReady(true);
        return;
      }
      try {
        const { data } = await axios.post(`${config.apiUrl}/auth/refresh`, {}, { withCredentials: true });
        const accessToken = data?.data?.accessToken as string;
        authStoreApi.setAccessToken(accessToken);
        const user = await authApi.me().catch(() => null);
        if (mounted && user) {
          setAuth(user, accessToken);
        } else if (mounted) {
          clearAuth();
        }
      } catch {
        if (mounted) clearAuth();
      } finally {
        if (mounted) setReady(true);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ready;
}
