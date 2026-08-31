// expo-secure-store has no real web implementation, so persist to localStorage instead —
// otherwise a session only lives in memory and a page reload drops it entirely. This isn't
// as safe as a native Keychain (readable by any script on the page, so vulnerable to XSS),
// but there's no httpOnly-cookie auth flow here, and this is the standard tradeoff for a
// token-based web SPA.
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
