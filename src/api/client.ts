import Constants from 'expo-constants';
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { deleteSecureItem, readSecureItem, writeSecureItem } from './secure-storage';

export const AUTH_TOKEN_STORAGE_KEY = 'workpool_auth_token';
export const AUTH_REFRESH_TOKEN_STORAGE_KEY = 'workpool_auth_refresh_token';

// Endpoints where a 401 is always a business-logic error (bad credentials, expired reset
// token, ...), never a "your session expired" signal — never worth a refresh-and-retry.
const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];

export const apiUrl = Constants.expoConfig?.extra?.apiUrl as string;

export const apiClient = axios.create({
  baseURL: apiUrl,
});

// Re-exported so callers (useAuthStore, etc.) don't need to know storage lives in its own
// module — secure-storage.ts is native (Keychain/Keystore), secure-storage.web.ts is web
// (localStorage), picked automatically by the bundler's platform extension resolution.
export { readSecureItem, writeSecureItem, deleteSecureItem };

// Set by useAuthStore so this module can reset auth state on an unrecoverable 401,
// without api/client.ts importing the store back (that would be circular — client.ts
// is imported by users.api.ts is imported by the store).
let handleSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: () => void): void {
  handleSessionExpired = handler;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await readSecureItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Single in-flight refresh shared by every request that hits a 401 at the same time,
// so concurrent requests don't each rotate (and invalidate each other's) refresh token.
let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = await readSecureItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
  if (!refreshToken) return null;

  try {
    const response = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
      `${apiUrl}/auth/refresh`,
      { refreshToken },
    );
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    await Promise.all([
      writeSecureItem(AUTH_TOKEN_STORAGE_KEY, accessToken),
      writeSecureItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, newRefreshToken),
    ]);
    return accessToken;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isPublicAuthPath = PUBLIC_AUTH_PATHS.some((path) => originalRequest?.url?.includes(path));

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isPublicAuthPath) {
      throw error;
    }
    originalRequest._retry = true;

    refreshPromise ??= performRefresh().finally(() => {
      refreshPromise = null;
    });
    const newAccessToken = await refreshPromise;

    if (!newAccessToken) {
      await Promise.all([
        deleteSecureItem(AUTH_TOKEN_STORAGE_KEY),
        deleteSecureItem(AUTH_REFRESH_TOKEN_STORAGE_KEY),
      ]);
      handleSessionExpired?.();
      throw error;
    }

    originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
    return apiClient(originalRequest);
  },
);
