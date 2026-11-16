import { apiClient } from './client';

// saves this phone's Expo push token on the logged-in user (backend sends booking pushes to it)
export async function savePushToken(token: string): Promise<void> {
  await apiClient.patch('/users/me/push-token', { token });
}
