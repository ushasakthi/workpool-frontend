import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TravelDay } from '@/types/booking.types';

interface TravelDatePickerProps {
  days: TravelDay[];
  value: string | null;
  onChange: (date: string) => void;
}

// one chip per day the ride runs; full days can't be picked
export function TravelDatePicker({ days, value, onChange }: TravelDatePickerProps) {
  const theme = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {days.map((day) => {
        const selected = day.date === value;
        const full = day.seatsLeft < 1;
        // "2026-11-18" is midnight UTC, so read it back in UTC
        const date = new Date(day.date);
        const weekday = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
        return (
          <Pressable
            key={day.date}
            accessibilityRole="button"
            disabled={full}
            onPress={() => onChange(day.date)}
            style={[
              styles.chip,
              { backgroundColor: selected ? theme.primary : theme.backgroundElement },
              full && styles.full,
            ]}>
            <ThemedText type="small" themeColor={selected ? 'onPrimary' : 'textSecondary'}>
              {weekday}
            </ThemedText>
            <ThemedText type="smallBold" themeColor={selected ? 'onPrimary' : 'text'}>
              {date.getUTCDate()}
            </ThemedText>
            <ThemedText type="small" themeColor={selected ? 'onPrimary' : 'textSecondary'}>
              {full ? 'Full' : `${day.seatsLeft} left`}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.two,
  },
  chip: {
    width: 64,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  full: {
    opacity: 0.4,
  },
});
