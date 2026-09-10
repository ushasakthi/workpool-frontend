import { apiUrl } from '@/api/client';

export interface RemoteImageSource {
  uri: string;
  headers?: Record<string, string>;
}

// Turns a relative API file path (e.g. the profile's `photoUrl`,
// `/users/:id/photo?v=…`) into an <Image> source with the bearer token attached,
// since those routes are auth-gated. Returns undefined when there's no path.
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
