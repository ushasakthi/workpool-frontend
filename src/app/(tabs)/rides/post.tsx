import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { RideForm } from '@/components/rides/ride-form';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { StateMessage } from '@/components/ui/state-message';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRideStore } from '@/stores/useRideStore';
import { useVehicleStore } from '@/stores/useVehicleStore';

const PROVIDER_ROLES: UserRole[] = [UserRole.DRIVER, UserRole.BOTH];

export default function PostRideScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const user = useAuthStore((state) => state.user);
  const vehicles = useVehicleStore((state) => state.vehicles);
  const loadVehicles = useVehicleStore((state) => state.load);
  const rides = useRideStore((state) => state.rides);
  const loadRides = useRideStore((state) => state.load);

  const isProvider = user ? PROVIDER_ROLES.includes(user.role) : false;

  useEffect(() => {
    if (!isProvider) return;
    void loadVehicles().catch(() => undefined);
    if (id) void loadRides().catch(() => undefined);
  }, [isProvider, loadVehicles, loadRides, id]);

  if (user && !isProvider) {
    return <Redirect href="/rides/search" />;
  }

  const editingRide = id ? rides?.find((ride) => ride.id === id) : undefined;
  const activeVehicles = (vehicles ?? []).filter((vehicle) => vehicle.isActive);
  // When editing, wait for the rides list so the form seeds from the real ride.
  const loading = !user || vehicles === null || (id != null && rides === null);

  return (
    <Screen header={<BackHeader onBack={() => router.back()} />} underTabBar>
      <ThemedText type="title" style={styles.title}>
        Post a ride
      </ThemedText>

      {loading ? (
        <FormSkeleton />
      ) : activeVehicles.length === 0 ? (
        <NoVehicleState onAdd={() => router.push('/commute/vehicle')} />
      ) : (
        <RideForm
          vehicles={activeVehicles}
          ride={editingRide}
          onDone={() => router.replace('/rides/my-rides')}
        />
      )}
    </Screen>
  );
}

function BackHeader({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onBack}
      hitSlop={8}
      style={[styles.backButton, { borderColor: theme.border }]}>
      <SymbolView name={Icons.back} size={16} tintColor={theme.text} />
    </Pressable>
  );
}

function NoVehicleState({ onAdd }: { onAdd: () => void }) {
  return (
    <StateMessage
      icon="car"
      title="Add a vehicle first"
      message="You'll need a vehicle on file before you can post a ride."
      action={{ label: 'Add vehicle', onPress: onAdd }}
    />
  );
}

function FormSkeleton() {
  return (
    <>
      <Skeleton height={128} radius={Spacing.three} />
      <Skeleton height={128} radius={Spacing.three} />
      <Skeleton height={48} />
      <Skeleton height={44} />
      <Skeleton height={48} />
      <Skeleton height={52} />
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
});
