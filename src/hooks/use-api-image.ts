import type { ImageSource } from 'expo-image';
import { useMemo } from 'react';

import { useAuthStore } from '@/stores/useAuthStore';
import { resolveApiImageSource } from '@/utils/media';

// native: expo-image can send the auth header itself
export function useApiImageSource(path: string | undefined | null): ImageSource | undefined {
  const token = useAuthStore((state) => state.token);
  return useMemo(() => resolveApiImageSource(path, token), [path, token]);
}
