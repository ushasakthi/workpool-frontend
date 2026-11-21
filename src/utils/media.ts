import { apiUrl } from '@/api/client';

export interface RemoteImageSource {
  uri: string;
  headers?: Record<string, string>;
}

// Image source with the auth token (photo routes need login)
export function resolveApiImageSource(
  path: string | undefined | null,
  token: string | null,
): RemoteImageSource | undefined {
  if (!path) {
    return undefined;
  }
  const uri = /^https?:\/\//.test(path) ? path : `${apiUrl}${path}`;
  return token ? { uri, headers: { Authorization: `Bearer ${token}` } } : { uri };
}
