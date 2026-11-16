import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TravelSummaryCard } from '@/components/travel/travel-summary-card';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { VehicleSummaryCard } from '@/components/vehicle/vehicle-summary-card';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useVehicleStore } from '@/stores/useVehicleStore';
import { getErrorMessage } from '@/utils/errors';

export default function CommuteScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const vehicles = useVehicleStore((state) => state.vehicles);
  const loadVehicles = useVehicleStore((state) => state.load);

  const [loadError, setLoadError] = useState<string | null>(null);

  const canOffer = user?.role === UserRole.DRIVER || user?.role === UserRole.BOTH;

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      await loadVehicles();
    } catch (err) {
      setLoadError(getErrorMessage(err));
    }
  }, [loadVehicles]);

  // vehicles can change on the vehicle screen, so reload when coming back
  useFocusEffect(
    useCallback(() => {
      if (canOffer) void load();
    }, [canOffer, load]),
  );

  const heading = (
    <View style={styles.heading}>
      <ThemedText style={styles.title}>Commute</ThemedText>
      <ThemedText themeColor="textSecondary">Your route and car — used to find matches.</ThemedText>
    </View>
  );

  if (!user || (canOffer && vehicles === null && !loadError)) {
    return (
      <Screen underTabBar>
        {heading}
        <CommuteSkeleton />
      </Screen>
    );
  }

  return (
    <Screen underTabBar>
      {heading}

      <TravelSummaryCard
        profile={user.travelProfile}
        onEdit={() => router.push('/commute/travel-profile')}
      />

      {canOffer ? (
        <VehicleSummaryCard
          vehicles={vehicles ?? []}
          error={loadError}
          onAdd={() => router.push({ pathname: '/commute/vehicle', params: { mode: 'add' } })}
          onOpen={(vehicle) =>
            router.push({ pathname: '/commute/vehicle', params: { vehicleId: vehicle.id } })
          }
          onSeeAll={() => router.push('/commute/vehicle')}
          onRetry={() => void load()}
        />
      ) : (
        <OfferRidesHint onPress={() => router.push('/profile')} />
      )}
    </Screen>
  );
}

// passengers: vehicles only appear after switching to "Offer rides"
function OfferRidesHint({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.hint, { borderColor: theme.border }]}>
      <SymbolView name={Icons.car} size={22} tintColor={theme.primary} />
      <View style={styles.grow}>
        <ThemedText type="smallBold" style={styles.hintTitle}>
          Want to offer rides?
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Switch to &apos;Offer rides&apos; in Profile → Edit
        </ThemedText>
      </View>
      <SymbolView name={Icons.chevronRight} size={16} tintColor={theme.textSecondary} />
    </Pressable>
  );
}

function CommuteSkeleton() {
  return (
    <>
      <View style={styles.skeletonGroup}>
        <Skeleton width={110} height={10} />
        <Skeleton height={220} radius={Spacing.three} />
      </View>
      <View style={styles.skeletonGroup}>
        <Skeleton width={80} height={10} />
        <Skeleton height={150} radius={Spacing.three} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: 700,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
  },
  hintTitle: {
    fontSize: 15,
  },
  grow: {
    flex: 1,
  },
  skeletonGroup: {
    gap: 10,
  },
});
