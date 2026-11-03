// web: expo-secure-store doesn't work here, so use localStorage.
// Less safe than Keychain (XSS can read it).
const STORAGE_PREFIX = 'workpool:';

export async function readSecureItem(key: string): Promise<string | null> {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + key);
  } catch {
    // Private browsing / storage disabled — behave as if there's no stored session.
    return null;
  }
}

export async function writeSecureItem(key: string, value: string): Promise<void> {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, value);
  } catch {
    // Ignore — session just won't survive a reload in this case.
  }
}

export async function deleteSecureItem(key: string): Promise<void> {
  try {
    window.localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // no-op
  }
}
