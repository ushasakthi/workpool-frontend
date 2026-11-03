import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/admin/avatar';
import { RideRoute } from '@/components/rides/ride-route';
import { ThemedText } from '@/components/themed-text';
import { TrustScoreBadge } from '@/components/trust/trust-score-badge';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBookingStore } from '@/stores/useBookingStore';
import { useRideStore } from '@/stores/useRideStore';
import type { RideMatch } from '@/types/ride.types';
import { getErrorMessage } from '@/utils/errors';
import { formatCost, formatSeatsLeft } from '@/utils/formatters';
import { formatRideSchedule } from '@/utils/schedule';

function seatWord(seats: number): string {
  return `${seats} seat${seats === 1 ? '' : 's'}`;
}

export default function RequestRideScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ride = useRideStore((state) => state.rideDetail);
  const loadRide = useRideStore((state) => state.loadRide);
  const requestRide = useBookingStore((state) => state.requestRide);

  const [seats, setSeats] = useState(1);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // usually already loaded by the ride detail screen
  const current = ride?.id === id ? ride : null;
  useEffect(() => {
    if (current) return;
    void loadRide(id).catch((err) => setError(getErrorMessage(err)));
  }, [current, id, loadRide]);

  async function send() {
    setError(null);
    setSending(true);
    try {
      await requestRide({ rideId: id, seatsRequested: seats });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (sent && current) {
    return (
      <SentState
        ride={current}
        seats={seats}
        onViewBookings={() => router.replace('/bookings')}
        onBack={() => router.back()}
      />
    );
  }

  return (
    <Screen header={<CloseHeader onClose={() => router.back()} />} underTabBar>
      {error && <Banner message={error} />}

      {current === null ? (
        !error && (
          <>
            <Skeleton height={150} radius={Spacing.four} />
            <Skeleton height={80} radius={Spacing.four} />
            <Skeleton height={130} radius={Spacing.four} />
          </>
        )
      ) : (
        <RequestForm
          ride={current}
          seats={seats}
          onChangeSeats={setSeats}
          sending={sending}
          onSend={() => void send()}
        />
      )}
    </Screen>
  );
}

function RequestForm({
  ride,
  seats,
  onChangeSeats,
  sending,
  onSend,
}: {
  ride: RideMatch;
  seats: number;
  onChangeSeats: (seats: number) => void;
  sending: boolean;
  onSend: () => void;
}) {
  const theme = useTheme();
  const firstName = ride.driver.name.split(' ')[0];
  // costContribution is per seat
  const total = ride.costContribution * seats;

  return (
    <>
      <View style={[styles.card, { borderColor: theme.border }]}>
        <View style={styles.driverRow}>
          <Avatar name={ride.driver.name} size={44} />
          <View style={styles.grow}>
            <ThemedText type="smallBold">{ride.driver.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatRideSchedule(ride.daysOfWeek, ride.departureTime)} · to work
            </ThemedText>
          </View>
          <TrustScoreBadge score={ride.driver.trustScore} compact />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <RideRoute ride={ride} />
      </View>

      <View style={[styles.card, styles.seatsRow, { borderColor: theme.border }]}>
        <View style={styles.grow}>
          <ThemedText type="smallBold">Seats</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatSeatsLeft(ride.seatsAvailable)} on this ride
          </ThemedText>
        </View>
        <StepButton
          icon="minus"
          label="One seat fewer"
          disabled={sending || seats <= 1}
          onPress={() => onChangeSeats(seats - 1)}
        />
        <ThemedText style={styles.seatCount}>{seats}</ThemedText>
        <StepButton
          icon="add"
          label="One seat more"
          disabled={sending || seats >= ride.seatsAvailable}
          onPress={() => onChangeSeats(seats + 1)}
        />
      </View>

      <View style={[styles.costBox, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.costLine}>
          <ThemedText type="small" themeColor="textSecondary">
            {formatCost(ride.costContribution)} × {seatWord(seats)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatCost(total)}
          </ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.costLine}>
          <ThemedText type="smallBold">Your cost contribution</ThemedText>
          <ThemedText style={styles.total}>{formatCost(total)}</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Only shared if {firstName} accepts
        </ThemedText>
      </View>

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <Button
          label={`Send request · ${formatCost(total)}`}
          loading={sending}
          disabled={ride.seatsAvailable < 1}
          onPress={onSend}
        />
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          You can cancel from My bookings
        </ThemedText>
      </View>
    </>
  );
}

function StepButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: 'minus' | 'add';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[styles.stepButton, { borderColor: theme.border }, disabled && styles.disabled]}>
      <SymbolView name={Icons[icon]} size={18} tintColor={theme.text} />
    </Pressable>
  );
}

function SentState({
  ride,
  seats,
  onViewBookings,
  onBack,
}: {
  ride: RideMatch;
  seats: number;
  onViewBookings: () => void;
  onBack: () => void;
}) {
  const theme = useTheme();
  const firstName = ride.driver.name.split(' ')[0];

  return (
    <Screen underTabBar>
      <View style={styles.sentWrap}>
        <View style={[styles.sentIcon, { backgroundColor: theme.primarySoft }]}>
          <SymbolView name={Icons.send} size={28} tintColor={theme.primary} />
        </View>
        <ThemedText style={styles.sentTitle}>Request sent to {firstName}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          {seatWord(seats)} · {formatCost(ride.costContribution * seats)} ·{' '}
          {formatRideSchedule(ride.daysOfWeek, ride.departureTime)}. You&apos;ll see the reply in My
          bookings.
        </ThemedText>
      </View>
      <View style={styles.footer}>
        <Button label="View my bookings" onPress={onViewBookings} />
        <Button label="Back to ride" variant="text" onPress={onBack} />
      </View>
    </Screen>
  );
}

function CloseHeader({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={8}>
        <SymbolView name={Icons.close} size={20} tintColor={theme.text} />
      </Pressable>
      <ThemedText style={styles.headerTitle}>Confirm your request</ThemedText>
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
  divider: {
    height: 1,
  },
  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatCount: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 700,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  costBox: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  costLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  total: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    gap: Spacing.two,
  },
  sentWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  sentIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  sentTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 700,
    textAlign: 'center',
  },
});
