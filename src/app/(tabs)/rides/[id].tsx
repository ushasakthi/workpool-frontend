import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/admin/avatar';
import { MatchingScoreBadge } from '@/components/rides/matching-score-badge';
import { RideRoute } from '@/components/rides/ride-route';
import { ThemedText } from '@/components/themed-text';
import { TrustScoreBadge } from '@/components/trust/trust-score-badge';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { StateMessage } from '@/components/ui/state-message';
import { StatusPill } from '@/components/ui/status-pill';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { VerificationStatus } from '@/constants/verification-status.enum';
import { useTheme } from '@/hooks/use-theme';
import { useRideStore } from '@/stores/useRideStore';
import type { RideMatch, SmsBreakdown } from '@/types/ride.types';
import { getErrorMessage } from '@/utils/errors';
import { formatCost, formatDistance, formatPercent, formatSeatsLeft } from '@/utils/formatters';
import { formatRideSchedule } from '@/utils/schedule';

// plain-language "why this match", one row per SMS sub-score
const BREAKDOWN_ROWS: { key: keyof SmsBreakdown; label: string }[] = [
  { key: 'route', label: 'Pickup near your home' },
  { key: 'time', label: 'Fits your work start time' },
  { key: 'workplace', label: 'Drop-off near your work' },
  { key: 'availability', label: 'Runs on your days' },
];

export default function RideDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ride = useRideStore((state) => state.rideDetail);
  const loadRide = useRideStore((state) => state.loadRide);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadRide(id).catch((err) => setError(getErrorMessage(err)));
  }, [id, loadRide]);

  function retry() {
    setError(null);
    void loadRide(id).catch((err) => setError(getErrorMessage(err)));
  }

  // the store may still hold the previous ride for a moment
  const current = ride?.id === id ? ride : null;

  return (
    <Screen
      header={
        <DetailHeader
          subtitle={current ? formatRideSchedule(current.daysOfWeek, current.departureTime) : undefined}
          onBack={() => router.back()}
        />
      }
      underTabBar>
      {error ? (
        <StateMessage
          icon="wifiSlash"
          tone="error"
          title="Couldn't load this ride"
          message={error}
          action={{ label: 'Try again', onPress: retry }}
        />
      ) : current === null ? (
        <>
          <Skeleton height={180} radius={Spacing.four} />
          <Skeleton height={140} radius={Spacing.four} />
          <Skeleton height={120} radius={Spacing.four} />
        </>
      ) : (
        <RideDetail
          ride={current}
          onRequest={() => router.push({ pathname: '/rides/request', params: { id: current.id } })}
          onOpenDriver={() =>
            router.push({ pathname: '/profile/[userId]', params: { userId: current.driver.id } })
          }
        />
      )}
    </Screen>
  );
}

function RideDetail({
  ride,
  onRequest,
  onOpenDriver,
}: {
  ride: RideMatch;
  onRequest: () => void;
  onOpenDriver: () => void;
}) {
  const theme = useTheme();
  const { driver } = ride;
  const firstName = driver.name.split(' ')[0];

  return (
    <>
      <View style={[styles.card, { borderColor: theme.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${driver.name}'s profile`}
          onPress={onOpenDriver}
          style={styles.driverRow}>
          <Avatar name={driver.name} size={56} />
          <ThemedText style={[styles.driverName, styles.grow]}>{driver.name}</ThemedText>
          <TrustScoreBadge score={driver.trustScore} />
        </Pressable>
        <View style={styles.pills}>
          {driver.verification.identityStatus === VerificationStatus.VERIFIED && (
            <StatusPill label="ID verified" showCheck tone="neutral" />
          )}
          {driver.verification.workplaceStatus === VerificationStatus.VERIFIED && (
            <StatusPill label="Workplace verified" showCheck tone="neutral" />
          )}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Trust Score is based on verification, completed rides and coworker ratings.
        </ThemedText>
      </View>

      <View style={[styles.card, { borderColor: theme.border }]}>
        <MatchingScoreBadge score={ride.match.score} />
        {BREAKDOWN_ROWS.map((row) => (
          <View key={row.key} style={styles.breakdownRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {row.label}
            </ThemedText>
            <ThemedText type="smallBold">{formatPercent(ride.match.breakdown[row.key])}</ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.card, { borderColor: theme.border }]}>
        <RideRoute
          ride={ride}
          pickupNote={
            ride.pickupDistanceKm === null
              ? 'Pickup'
              : `Passes ${formatDistance(ride.pickupDistanceKm)} from your home`
          }
          dropoffNote="Drop-off"
        />
      </View>

      <View style={styles.stats}>
        <StatBox label="Seats" value={formatSeatsLeft(ride.seatsAvailable)} />
        <StatBox label="Cost contribution" value={formatCost(ride.costContribution)} />
      </View>

      <View style={styles.footer}>
        <Button
          label={ride.seatsAvailable < 1 ? 'Ride is full' : 'Request ride'}
          trailingArrow
          disabled={ride.seatsAvailable < 1}
          onPress={onRequest}
        />
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          {firstName} confirms before you&apos;re added
        </ThemedText>
      </View>
    </>
  );
}

function DetailHeader({ subtitle, onBack }: { subtitle?: string; onBack: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} hitSlop={8}>
        <SymbolView name={Icons.back} size={20} tintColor={theme.text} />
      </Pressable>
      <View style={styles.grow}>
        <ThemedText style={styles.headerTitle}>Ride to work</ThemedText>
        {subtitle && (
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.statBox, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  grow: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  driverName: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  statBox: {
    flex: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 700,
  },
  footer: {
    gap: Spacing.two,
  },
});
