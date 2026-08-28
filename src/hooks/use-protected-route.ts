import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { UserRole } from '@/constants/user-role.enum';
import { VerificationStatus } from '@/constants/verification-status.enum';
import { useAuthStore } from '@/stores/useAuthStore';

// Auth screens reachable while logged out.
const PUBLIC_SCREENS = new Set(['login', 'register', 'forgot-password', 'reset-password']);
// Auth screens reachable while logged in but not yet fully verified.
const ONBOARDING_SCREENS = new Set(['verify', 'pending-verification']);

/**
 * Keeps the current route in sync with auth/verification state: unauthenticated users are
 * confined to the public auth screens, admins are confined to the (admin) section, regular
 * authenticated-but-unverified users to the onboarding screens, and only fully verified
 * users can reach the (tabs) app. Runs on every relevant state/segment change rather than
 * forcing one canonical screen, so e.g. "Edit submission" can freely move between
 * verify <-> pending-verification.
 */
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
        router.replace('/login');
      }
      return;
    }

    if (user.role === UserRole.ADMIN) {
      // (admin) is a route group, not a URL segment — the actual path is /verifications.
      if (!inAdminGroup) {
        router.replace('/verifications');
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
