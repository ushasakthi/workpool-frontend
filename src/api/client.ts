import Constants from 'expo-constants';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const AUTH_TOKEN_STORAGE_KEY = 'workpool_auth_token';

const apiUrl = Constants.expoConfig?.extra?.apiUrl as string;

export const apiClient = axios.create({
  baseURL: apiUrl,
});

apiClient.interceptors.request.use(async (config) => {
  // expo-secure-store has no web implementation, so token reads are
  // best-effort there — the request proceeds unauthenticated instead of failing.
  try {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  } catch {
    // no-op: unsupported platform (web) or empty store
  }
  return config;
});
