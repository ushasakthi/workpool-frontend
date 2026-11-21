import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { WEEKDAYS_IN_ORDER, Weekday } from '@/constants/weekday.enum';
import { useTheme } from '@/hooks/use-theme';

interface DaySelectorProps {
  value: Weekday[];
  onChange: (days: Weekday[]) => void;
  size?: 'short' | 'medium';
}

export function DaySelector({ value, onChange, size = 'short' }: DaySelectorProps) {
  const theme = useTheme();

  function toggle(day: Weekday) {
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day]);
  }

  return (
    <View style={styles.row}>
      {WEEKDAYS_IN_ORDER.map((entry, index) => {
        const day = entry.value;
        const selected = value.includes(day);
        return (
          <Pressable
            key={`${day}-${index}`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={day}
            onPress={() => toggle(day)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? theme.primary : theme.backgroundElement,
              },
            ]}>
            <ThemedText type="smallBold" themeColor={selected ? 'onPrimary' : 'textSecondary'}>
              {entry[size]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
