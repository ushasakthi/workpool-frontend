import Constants from 'expo-constants';
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { deleteSecureItem, readSecureItem, writeSecureItem } from './secure-storage';
import { useConnectionStore } from '@/stores/useConnectionStore';

export const AUTH_TOKEN_STORAGE_KEY = 'workpool_auth_token';
export const AUTH_REFRESH_TOKEN_STORAGE_KEY = 'workpool_auth_refresh_token';

// a 401 here means wrong input, not an expired session, so don't refresh
const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];

export const apiUrl = Constants.expoConfig?.extra?.apiUrl as string;

// give up on a request after this long instead of hanging the screen
const REQUEST_TIMEOUT_MS = 15_000;
// one quiet retry for reads after a network blip or a 5xx
const RETRY_DELAY_MS = 1_000;

export const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: REQUEST_TIMEOUT_MS,
});

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean; _networkRetry?: boolean };

// no reply at all (offline, server down, timeout) vs. a reply with an error status
function isConnectionProblem(error: AxiosError): boolean {
  return !error.response;
}

// Only GETs are retried: re-sending a POST/PATCH (e.g. "accept booking")
// could do the action twice.
async function retryReadOnce(error: AxiosError): Promise<unknown> {
  const request = error.config as RetryableRequest | undefined;
  const status = error.response?.status ?? 0;
  const retryable = isConnectionProblem(error) || status >= 500;
  if (!request || request.method !== 'get' || request._networkRetry || !retryable) {
    throw error;
  }
  request._networkRetry = true;
  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  return apiClient(request);
}

// secure-storage.ts or .web.ts is picked by platform
export { readSecureItem, writeSecureItem, deleteSecureItem };

// set by useAuthStore (importing the store here would be circular)
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

// share one refresh between requests that get a 401 at the same time
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
  (response) => {
    useConnectionStore.getState().setOffline(false);
    return response;
  },
  async (error: AxiosError) => {
    if (isConnectionProblem(error)) {
      useConnectionStore.getState().setOffline(true);
    }

    const originalRequest = error.config as RetryableRequest | undefined;
    const isPublicAuthPath = PUBLIC_AUTH_PATHS.some((path) => originalRequest?.url?.includes(path));

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isPublicAuthPath) {
      return retryReadOnce(error);
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
