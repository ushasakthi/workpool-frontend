import type { ImageSource } from 'expo-image';
import { useEffect, useState } from 'react';

import { apiClient } from '@/api/client';

// Web: a browser <img> can't send an Authorization header, so fetch the auth-gated
// file as a blob (the axios interceptor attaches the token) and hand the component
// an object URL instead.
export function useApiImageSource(path: string | undefined | null): ImageSource | undefined {
  const [resolved, setResolved] = useState<{ path: string; url: string } | undefined>(undefined);

  useEffect(() => {
    if (!path) return;

    let cancelled = false;
    let objectUrl: string | undefined;

    apiClient
      .get<Blob>(path, { responseType: 'blob' })
      .then((response) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(response.data);
        setResolved({ path, url: objectUrl });
      })
      .catch(() => {
        // leave the previous image in place on a transient failure
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  return resolved && resolved.path === path ? { uri: resolved.url } : undefined;
}
