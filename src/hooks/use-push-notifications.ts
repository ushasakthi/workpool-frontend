import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { type Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { savePushToken } from '@/api/push.api';
import { useAuthStore } from '@/stores/useAuthStore';

async function registerForPush(): Promise<void> {
  // without this, Android hides notifications that arrive while the app is open
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Android needs a channel before it can show any notification
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Booking updates',
    importance: Notifications.AndroidImportance.HIGH,
  });

  const { status } = await Notifications.requestPermissionsAsync();
  // denied: do nothing, booking emails still arrive
  if (status !== 'granted') return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await savePushToken(token);
}

// Android only: after login, registers this phone for booking notifications,
// and opens the matching screen when one is tapped
export function usePushNotifications() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (Platform.OS !== 'android' || !isAuthenticated) return;
    registerForPush().catch((error) => console.warn('Push registration failed', error));
  }, [isAuthenticated]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      // set by the backend, e.g. 'bookings/requests'
      const path = response.notification.request.content.data?.path;
      if (typeof path === 'string') {
        router.push(`/${path}` as Href);
      }
    });
    return () => subscription.remove();
  }, [router]);
}
