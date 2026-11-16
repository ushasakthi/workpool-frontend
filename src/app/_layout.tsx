import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { usePushNotifications } from '@/hooks/use-push-notifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useProtectedRoute();
  usePushNotifications();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(tabs)" />
        {/* modal lives here, not inside a tab, so iOS closes the sheet when we navigate away */}
        <Stack.Screen
          name="ride-request"
          options={{ presentation: Platform.OS === 'web' ? 'card' : 'modal' }}
        />
      </Stack>
      {/* on top of every screen, shown only while the API can't be reached */}
      <OfflineBanner />
    </ThemeProvider>
  );
}
