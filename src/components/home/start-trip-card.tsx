import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { RideRoute } from '@/components/rides/ride-route';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TodayRide } from '@/types/trip.types';
import { formatClockTime } from '@/utils/formatters';

interface StartTripCardProps {
  ride: TodayRide;
  now: Date;
  starting: boolean;
  error: string | null;
  onStart: () => void;
}

// driver's Home card for a ride that runs today
export function StartTripCard({ ride, now, starting, error, onStart }: StartTripCardProps) {
  const theme = useTheme();
  const tooEarly = now < new Date(ride.canStartAt);

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
        NEXT TRIP
      </ThemedText>
      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={styles.topRow}>
          <ThemedText style={styles.day}>Today · {formatClockTime(ride.departureTime)}</ThemedText>
          <ThemedText type="smallBold" themeColor="textSecondary">
            You drive
          </ThemedText>
        </View>

        <RideRoute ride={ride} />

        {ride.riders === 0 ? (
          <View style={[styles.infoRow, { backgroundColor: theme.backgroundElement }]}>
            <SymbolView name={Icons.people} size={16} tintColor={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              No riders booked for today
            </ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.row}>
              <SymbolView name={Icons.people} size={16} tintColor={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                {ride.riders} rider{ride.riders === 1 ? '' : 's'} booked
              </ThemedText>
            </View>
            {error && (
              <ThemedText type="small" themeColor="error">
                {error}
              </ThemedText>
            )}
            <Button
              label="Start trip"
              icon="play"
              loading={starting}
              disabled={tooEarly}
              onPress={onStart}
            />
            {tooEarly && (
              <View style={[styles.row, styles.center]}>
                <SymbolView name={Icons.clock} size={14} tintColor={theme.textSecondary} />
                <ThemedText type="small" themeColor="textSecondary">
                  You can start from {formatClockTime(ride.canStartAt)}
                </ThemedText>
              </View>
            )}
          </>
        )}
      </View>
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
  },
  day: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  center: {
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
});
