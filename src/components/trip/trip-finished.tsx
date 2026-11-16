import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TripSummary } from '@/types/trip.types';
import { formatClockTime, formatCost } from '@/utils/formatters';

interface TripFinishedProps {
  summary: TripSummary;
  // undefined once every rider has been rated
  onRate?: () => void;
  onHome: () => void;
}

export function TripFinished({ summary, onRate, onHome }: TripFinishedProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.middle}>
        <View style={[styles.checkCircle, { backgroundColor: theme.primarySoft }]}>
          <SymbolView name={Icons.check} size={44} tintColor={theme.primary} />
        </View>
        <ThemedText style={styles.title}>Trip finished</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          {summary.origin.label ?? 'Start'} → {summary.destination.label ?? 'Destination'} ·{' '}
          {formatClockTime(summary.startedAt)}–{formatClockTime(summary.finishedAt)}
        </ThemedText>
        <View style={styles.chips}>
          <Chip icon="people" label={`${summary.riders} rider${summary.riders === 1 ? '' : 's'}`} />
          <Chip icon="savings" label={`${formatCost(summary.costsShared)} costs shared`} />
          <Chip icon="leaf" label={`${summary.co2SavedKg} kg CO₂ saved`} />
        </View>
      </View>

      <View style={styles.buttons}>
        {onRate && <Button label="Rate your riders" icon="star" onPress={onRate} />}
        <Button label="Back to Home" variant="text" onPress={onHome} />
      </View>
    </View>
  );
}

function Chip({ icon, label }: { icon: keyof typeof Icons; label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.chip, { borderColor: theme.border, backgroundColor: theme.background }]}>
      <SymbolView
        name={Icons[icon]}
        size={16}
        tintColor={icon === 'leaf' ? theme.primary : theme.textSecondary}
      />
      <ThemedText type="smallBold">{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'space-between',
    gap: Spacing.five,
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 800,
  },
  center: {
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  buttons: {
    gap: Spacing.two,
  },
});
