import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { UserRole } from '@/constants/user-role.enum';
import { VerificationStatus } from '@/constants/verification-status.enum';
import { useAuthStore } from '@/stores/useAuthStore';

// Auth screens reachable while logged out.
const PUBLIC_SCREENS = new Set([
  'login',
  'admin-login',
  'register',
  'forgot-password',
  'reset-password',
]);
// on web, logged-out users go to the admin login
const DEFAULT_LOGGED_OUT_SCREEN = Platform.OS === 'web' ? '/admin-login' : '/login';
// Auth screens reachable while logged in but not yet fully verified.
const ONBOARDING_SCREENS = new Set(['verify', 'pending-verification']);

// Redirects users based on login, role and verification status
export function useProtectedRoute() {
  const router = useRouter();
  const segments = useSegments();
  const status = useAuthStore((state) => state.status);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status === 'idle' || status === 'hydrating') return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const currentAuthScreen = inAuthGroup ? segments[1] : undefined;

    if (!isAuthenticated || !user) {
      if (!currentAuthScreen || !PUBLIC_SCREENS.has(currentAuthScreen)) {
        router.replace(DEFAULT_LOGGED_OUT_SCREEN);
      }
      return;
    }

    if (user.role === UserRole.ADMIN) {
      // (admin) is a group, so the real path is /home
      if (!inAdminGroup) {
        router.replace('/home');
      }
      return;
    }

    if (inAdminGroup) {
      router.replace('/');
      return;
    }

    const isFullyVerified =
      user.verification.identityStatus === VerificationStatus.VERIFIED &&
      user.verification.workplaceStatus === VerificationStatus.VERIFIED;

    if (!isFullyVerified) {
      if (!currentAuthScreen || !ONBOARDING_SCREENS.has(currentAuthScreen)) {
        router.replace(user.linkedinUrl ? '/pending-verification' : '/verify');
      }
      return;
    }

    if (inAuthGroup) {
      router.replace('/');
    }
  }, [status, isAuthenticated, user, segments, router]);
}
