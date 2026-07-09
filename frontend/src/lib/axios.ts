import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { config } from '@/config/env';
import { authStoreApi } from '@/store/authStore';

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true, // send the httpOnly refresh-token cookie
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((req) => {
  const token = authStoreApi.getAccessToken();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Queue of requests waiting for a fresh token, so concurrent 401s only trigger one refresh call.
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh when the failing call IS the refresh/login/register call itself.
    const skipUrls = ['/auth/refresh', '/auth/login', '/auth/register'];
    if (skipUrls.some((u) => originalRequest.url?.includes(u))) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) return reject(error);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(
        `${config.apiUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const newToken = data?.data?.accessToken as string;
      authStoreApi.setAccessToken(newToken);
      resolveQueue(newToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      resolveQueue(null);
      authStoreApi.clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
