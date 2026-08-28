import { create } from 'zustand';

import {
  AUTH_REFRESH_TOKEN_STORAGE_KEY,
  AUTH_TOKEN_STORAGE_KEY,
  deleteSecureItem,
  readSecureItem,
  setSessionExpiredHandler,
  writeSecureItem,
} from '@/api/client';
import { getMe } from '@/api/users.api';
import type { AuthResult, UserProfile } from '@/types/user.types';

type AuthStatus = 'idle' | 'hydrating' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  token: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  hydrate: () => Promise<void>;
  setSession: (result: AuthResult) => Promise<void>;
  clearSession: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,

  hydrate: async () => {
    set({ status: 'hydrating' });

    const [token, refreshToken] = await Promise.all([
      readSecureItem(AUTH_TOKEN_STORAGE_KEY),
      readSecureItem(AUTH_REFRESH_TOKEN_STORAGE_KEY),
    ]);

    if (!token) {
      set({ status: 'unauthenticated', token: null, refreshToken: null, user: null, isAuthenticated: false });
      return;
    }

    try {
      const user = await getMe();
      set({ status: 'authenticated', token, refreshToken, user, isAuthenticated: true });
    } catch {
      // Stored token is stale/invalid (expired, revoked, etc.) — drop it and start fresh.
      await Promise.all([
        deleteSecureItem(AUTH_TOKEN_STORAGE_KEY),
        deleteSecureItem(AUTH_REFRESH_TOKEN_STORAGE_KEY),
      ]);
      set({ status: 'unauthenticated', token: null, refreshToken: null, user: null, isAuthenticated: false });
    }
  },

  setSession: async (result) => {
    await Promise.all([
      writeSecureItem(AUTH_TOKEN_STORAGE_KEY, result.accessToken),
      writeSecureItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, result.refreshToken),
    ]);

    const user = await getMe();
    set({
      status: 'authenticated',
      token: result.accessToken,
      refreshToken: result.refreshToken,
      user,
      isAuthenticated: true,
    });
  },

  clearSession: async () => {
    await Promise.all([
      deleteSecureItem(AUTH_TOKEN_STORAGE_KEY),
      deleteSecureItem(AUTH_REFRESH_TOKEN_STORAGE_KEY),
    ]);
    set({ status: 'unauthenticated', token: null, refreshToken: null, user: null, isAuthenticated: false });
  },

  refreshMe: async () => {
    const user = await getMe();
    set({ user });
  },
}));

// If a request's refresh-on-401 attempt fails outright (refresh token itself expired or
// revoked), drop the session so the auth gate redirects to login instead of leaving the
// app stuck showing stale "Unauthorized" errors from every subsequent request.
setSessionExpiredHandler(() => {
  void useAuthStore.getState().clearSession();
});
