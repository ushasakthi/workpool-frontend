import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface FilterTab<T extends string> {
  value: T;
  label: string;
}

interface FilterTabsProps<T extends string> {
  tabs: FilterTab<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterTabs<T extends string>({ tabs, value, onChange }: FilterTabsProps<T>) {
  const theme = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
      {tabs.map((tab) => {
        const isSelected = tab.value === value;
        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(tab.value)}
            style={[styles.tab, isSelected && { backgroundColor: theme.background }]}>
            <ThemedText
              type="smallBold"
              themeColor={isSelected ? 'primary' : 'textSecondary'}
              style={styles.label}>
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: Spacing.five,
    padding: Spacing.half,
  },
  tab: {
    flex: 1,
    borderRadius: Spacing.five,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
