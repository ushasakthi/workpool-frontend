import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { LiveDot } from '@/components/trip/live-dot';
import { PinBox } from '@/components/trip/pin-box';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { PassengerTrip } from '@/types/trip.types';
import { formatClockTime } from '@/utils/formatters';
import { firstName } from '@/utils/home';
import { vehicleLabel } from '@/utils/trip';

// passenger's Home card while their driver is on the trip: "on the way", then "on board"
export function PassengerTripCard({ trip, onPress }: { trip: PassengerTrip; onPress: () => void }) {
  const theme = useTheme();
  const driver = firstName(trip.driver.name);
  const { pickedUpAt, pickupPin } = trip.booking;
  // before pickup the plate helps find the car; after, just who you're riding with
  const carLine = pickedUpAt
    ? trip.vehicle
      ? `${driver} · ${trip.vehicle.make} ${trip.vehicle.model}`
      : driver
    : (vehicleLabel(trip) ?? driver);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={styles.topRow}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.label}>
          RIDING NOW
        </ThemedText>
        <View style={[styles.pill, { backgroundColor: theme.primary }]}>
          <LiveDot color={theme.onPrimary} />
          <ThemedText type="smallBold" themeColor="onPrimary">
            {pickedUpAt ? 'On board' : 'On the way'}
          </ThemedText>
        </View>
      </View>

      {pickedUpAt ? (
        <View>
          <ThemedText style={styles.title}>
            On the way to {trip.dropOffLabel}
          </ThemedText>
          <View style={styles.row}>
            <SymbolView name={Icons.checkCircle} size={15} tintColor={theme.primary} />
            <ThemedText type="small" themeColor="textSecondary">
              Picked up {formatClockTime(pickedUpAt)}
            </ThemedText>
          </View>
        </View>
      ) : (
        <View>
          <ThemedText style={styles.title}>{driver} is on the way</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            You&apos;re stop {trip.stopNumber} of {trip.stopCount}
          </ThemedText>
        </View>
      )}

      {pickupPin && <PinBox label="YOUR PIN" pin={pickupPin} size="medium" />}

      <View style={styles.row}>
        <SymbolView name={Icons.car} size={16} tintColor={theme.textSecondary} />
        <ThemedText type="smallBold" style={styles.grow}>
          {carLine}
        </ThemedText>
        <SymbolView name={Icons.chevronRight} size={18} tintColor={theme.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.7,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 999,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 800,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  grow: {
    flex: 1,
  },
});
