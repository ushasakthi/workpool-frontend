import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { LiveDot } from '@/components/trip/live-dot';
import { ProgressBar } from '@/components/trip/progress-bar';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DriverTrip } from '@/types/trip.types';
import { firstName } from '@/utils/home';
import { nextDropOff, nextStop, pickedUpCount } from '@/utils/trip';

// driver's Home card while a trip runs; solid green so it stands out from every other card
export function RidingNowCard({ trip, onPress }: { trip: DriverTrip; onPress: () => void }) {
  const theme = useTheme();
  const picked = pickedUpCount(trip);
  const total = trip.stops.length;
  const next = nextStop(trip);
  const dropOff = nextDropOff(trip);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.primary }]}>
      <ThemedText type="smallBold" themeColor="onPrimary" style={styles.label}>
        RIDING NOW
      </ThemedText>
      <View style={styles.row}>
        <LiveDot color={theme.onPrimary} />
        <ThemedText type="smallBold" themeColor="onPrimary">
          Live · Trip in progress
        </ThemedText>
      </View>
      <ThemedText themeColor="onPrimary" style={styles.big}>
        {picked} of {total} picked up
      </ThemedText>
      <ProgressBar
        value={total === 0 ? 1 : picked / total}
        color={theme.onPrimary}
        trackColor="rgba(255,255,255,0.25)"
      />
      <View style={styles.nextRow}>
        <ThemedText type="smallBold" themeColor="onPrimary" style={styles.grow}>
          {next
            ? `Next: ${firstName(next.passenger.name)} · ${next.pickupLabel}`
            : dropOff
              ? `Next: Drop off ${firstName(dropOff.passenger.name)} · ${dropOff.dropOffLabel}`
              : `Next: End · ${trip.destination.label ?? 'Destination'}`}
        </ThemedText>
        <SymbolView name={Icons.arrowRight} size={20} tintColor={theme.onPrimary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.7,
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  big: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 800,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: Spacing.three,
    marginTop: Spacing.one,
  },
  grow: {
    flex: 1,
  },
});
