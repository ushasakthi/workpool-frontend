import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PastDriveCard } from '@/components/rides/past-drive-card';
import { RidesSegment } from '@/components/rides/rides-segment';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { StateMessage } from '@/components/ui/state-message';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { useAuthStore } from '@/stores/useAuthStore';
import { useBookingStore } from '@/stores/useBookingStore';
import { groupDrivesByDay, isInPastWeeks, PAST_WEEKS } from '@/utils/bookings';
import { getErrorMessage } from '@/utils/errors';

const PROVIDER_ROLES: UserRole[] = [UserRole.DRIVER, UserRole.BOTH];

export default function PastRidesScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const pastDrives = useBookingStore((state) => state.pastDrives);
  const load = useBookingStore((state) => state.loadPastDrives);

  const [loadError, setLoadError] = useState<string | null>(null);

  const isProvider = user ? PROVIDER_ROLES.includes(user.role) : false;

  useEffect(() => {
    if (!isProvider) return;
    void load().catch((err) => setLoadError(getErrorMessage(err)));
  }, [isProvider, load]);

  if (user && !isProvider) {
    return <Redirect href="/rides/search" />;
  }

  function retryLoad() {
    setLoadError(null);
    void load().catch((err) => setLoadError(getErrorMessage(err)));
  }

  const now = new Date();
  const drives = groupDrivesByDay(
    (pastDrives ?? []).filter((booking) => isInPastWeeks(booking, now)),
  );

  return (
    <Screen header={<RidesSegment active="past" />} underTabBar>
      <View style={styles.headerText}>
        <ThemedText type="title" style={styles.title}>
          Past rides
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Rides you drove in the last {PAST_WEEKS} weeks.
        </ThemedText>
      </View>

      {pastDrives === null ? (
        loadError ? (
          <StateMessage
            icon="wifiSlash"
            tone="error"
            title="Couldn't load your past rides"
            message={loadError}
            action={{ label: 'Try again', variant: 'soft', onPress: retryLoad }}
          />
        ) : (
          <>
            <Skeleton height={160} radius={Spacing.three} />
            <Skeleton height={160} radius={Spacing.three} />
          </>
        )
      ) : drives.length === 0 ? (
        <StateMessage
          icon="history"
          title="No past rides yet"
          message="Trips you finish will show up here."
        />
      ) : (
        drives.map((drive) => (
          <PastDriveCard
            key={`${drive.rideId}-${drive.date}`}
            drive={drive}
            onRate={(bookingId) =>
              router.push({ pathname: '/bookings/review', params: { bookingId } })
            }
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerText: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
});
