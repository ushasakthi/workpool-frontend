import * as SecureStore from 'expo-secure-store';

// Native (iOS/Android) implementation — backed by the real platform Keychain/Keystore via
// expo-secure-store. See secure-storage.web.ts for the web counterpart.
export async function readSecureItem(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function writeSecureItem(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function deleteSecureItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
