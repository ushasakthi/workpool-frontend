import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Ride } from '@/types/ride.types';
import { timeOfDayFromISO } from '@/utils/schedule';
import { formatHhMmForDisplay } from '@/utils/time';

interface RideRouteProps {
  // only the route fields, so a booking's ride summary works too
  ride: Pick<Ride, 'origin' | 'destination' | 'departureTime'>;
  // small line under each stop, e.g. "350 m walk"
  pickupNote?: string;
  dropoffNote?: string;
}

// pickup dot, dashed line, drop-off square
export function RideRoute({ ride, pickupNote, dropoffNote }: RideRouteProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.markers}>
        <View style={[styles.dot, { backgroundColor: theme.accent }]} />
        <View style={[styles.line, { borderColor: theme.accent }]} />
        <View style={[styles.square, { backgroundColor: theme.accent }]} />
      </View>

      <View style={styles.stops}>
        <View style={styles.stopRow}>
          <View style={styles.grow}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {ride.origin.label ?? 'Pickup'}
            </ThemedText>
            {pickupNote && (
              <ThemedText type="small" themeColor="textSecondary">
                {pickupNote}
              </ThemedText>
            )}
          </View>
          <ThemedText type="smallBold">
            {formatHhMmForDisplay(timeOfDayFromISO(ride.departureTime))}
          </ThemedText>
        </View>

        <View style={styles.grow}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {ride.destination.label ?? 'Drop-off'}
          </ThemedText>
          {dropoffNote && (
            <ThemedText type="small" themeColor="textSecondary">
              {dropoffNote}
            </ThemedText>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  markers: {
    alignItems: 'center',
    paddingVertical: Spacing.two - 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    flex: 1,
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    marginVertical: Spacing.one,
  },
  square: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  stops: {
    flex: 1,
    gap: Spacing.three,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  grow: {
    flex: 1,
  },
});
