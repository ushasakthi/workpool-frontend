import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { BookingStatusTag } from '@/components/bookings/booking-status-tag';
import { CardError } from '@/components/home/card-error';
import { RideRoute } from '@/components/rides/ride-route';
import { ThemedText } from '@/components/themed-text';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill } from '@/components/ui/status-pill';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatTripDay, type NextTrip } from '@/utils/home';

interface NextTripCardProps {
  // null = nothing coming up
  trip: NextTrip | null;
  loading: boolean;
  error: string | null;
  // "both" users see which side the trip is on
  showSide: boolean;
  onPress: () => void;
  onRetry: () => void;
}

export function NextTripCard({ trip, loading, error, showSide, onPress, onRetry }: NextTripCardProps) {
  const theme = useTheme();

  let body;
  if (error) {
    body = <CardError message="Couldn't load your trips" onRetry={onRetry} />;
  } else if (loading) {
    body = <Skeleton height={180} radius={Spacing.three} />;
  } else if (!trip) {
    body = <EmptyTrip />;
  } else {
    body = (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={styles.topRow}>
          <View>
            {showSide && (
              <ThemedText type="small" themeColor="textSecondary">
                {trip.side === 'driver' ? 'As driver' : 'As passenger'}
              </ThemedText>
            )}
            <ThemedText style={styles.day}>{formatTripDay(trip.at)}</ThemedText>
          </View>
          {trip.side === 'passenger' && <BookingStatusTag status={trip.booking.status} />}
          {trip.side === 'driver' && trip.waiting > 0 && (
            <StatusPill
              tone="warning"
              icon="inbox"
              label={`${trip.waiting} request${trip.waiting === 1 ? '' : 's'} waiting`}
            />
          )}
        </View>

        <RideRoute ride={trip.side === 'driver' ? trip.ride : trip.booking.ride} />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {trip.side === 'passenger' ? <PassengerFooter trip={trip} /> : <DriverFooter trip={trip} />}
      </Pressable>
    );
  }

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
        NEXT TRIP
      </ThemedText>
      {body}
    </View>
  );
}

function PassengerFooter({ trip }: { trip: Extract<NextTrip, { side: 'passenger' }> }) {
  const theme = useTheme();
  const { otherParty: driver, pickupPin } = trip.booking;

  return (
    <>
      <View style={styles.personRow}>
        <View style={[styles.personAvatar, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {driver.name.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.grow}>
          <ThemedText type="smallBold">{driver.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Driver
          </ThemedText>
        </View>
        {driver.trustScore !== null && (
          <View style={styles.trust}>
            <SymbolView name={Icons.starFill} size={14} tintColor={theme.accent} />
            <ThemedText type="smallBold">{driver.trustScore}</ThemedText>
          </View>
        )}
      </View>

      {pickupPin && (
        <View style={[styles.pinRow, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
            PICKUP PIN
          </ThemedText>
          <View style={styles.pinDigits}>
            {pickupPin.split('').map((digit, index) => (
              <ThemedText key={index} style={styles.pinDigit}>
                {digit}
              </ThemedText>
            ))}
          </View>
        </View>
      )}
    </>
  );
}

function DriverFooter({ trip }: { trip: Extract<NextTrip, { side: 'driver' }> }) {
  const theme = useTheme();
  // accepting a request lowers seatsAvailable, so taken + left = seats offered
  const totalSeats = trip.seatsTaken + trip.ride.seatsAvailable;

  return (
    <View style={styles.personRow}>
      <SymbolView name={Icons.people} size={20} tintColor={theme.textSecondary} />
      <ThemedText type="smallBold" style={styles.grow}>
        {trip.seatsTaken} of {totalSeats} seats taken
      </ThemedText>
      <View style={styles.seatDots}>
        {Array.from({ length: totalSeats }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.seatDot,
              index < trip.seatsTaken
                ? { backgroundColor: theme.primary }
                : { borderWidth: 1.5, borderColor: theme.textSecondary },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function EmptyTrip() {
  const theme = useTheme();
  return (
    <View style={[styles.card, styles.empty, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundElement }]}>
        <SymbolView name={Icons.calendar} size={20} tintColor={theme.textSecondary} />
      </View>
      <ThemedText type="smallBold" style={styles.emptyTitle}>
        No trips coming up
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Find or offer a ride to get started.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.7,
  },
  card: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  day: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  divider: {
    height: 1,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  personAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
  trust: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pinDigits: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  pinDigit: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: 800,
    fontVariant: ['tabular-nums'],
  },
  seatDots: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  seatDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 22,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
  },
});
