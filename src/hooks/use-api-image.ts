import type { ImageSource } from 'expo-image';
import { useMemo } from 'react';

import { useAuthStore } from '@/stores/useAuthStore';
import { resolveApiImageSource } from '@/utils/media';

// Native: expo-image can send the bearer header itself, so the source is just
// { uri, headers }. (The web build fetches a blob instead — see .web.ts.)
export function useApiImageSource(path: string | undefined | null): ImageSource | undefined {
  const token = useAuthStore((state) => state.token);
  return useMemo(() => resolveApiImageSource(path, token), [path, token]);
}
