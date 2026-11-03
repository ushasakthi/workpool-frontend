import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ChecklistItem {
  label: string;
  done: boolean;
  onPress: () => void;
}

// hidden once every step is done
export function SetupChecklist({ items }: { items: ChecklistItem[] }) {
  const theme = useTheme();
  const left = items.filter((item) => !item.done).length;
  if (left === 0) return null;

  return (
    <View style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.header}>
        <ThemedText type="smallBold" style={styles.title}>
          Finish setting up
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {left} of {items.length} left
        </ThemedText>
      </View>

      {items.map((item) => (
        <Pressable
          key={item.label}
          accessibilityRole="button"
          disabled={item.done}
          onPress={item.onPress}
          style={[styles.row, { borderTopColor: theme.border }]}>
          <SymbolView
            name={item.done ? Icons.checkCircle : Icons.circle}
            size={20}
            tintColor={item.done ? theme.primary : theme.textSecondary}
          />
          <ThemedText
            type={item.done ? 'small' : 'smallBold'}
            themeColor={item.done ? 'textSecondary' : 'text'}
            style={styles.label}>
            {item.label}
          </ThemedText>
          {item.done ? (
            <ThemedText type="small" themeColor="textSecondary">
              Done
            </ThemedText>
          ) : (
            <SymbolView name={Icons.chevronRight} size={16} tintColor={theme.textSecondary} />
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: 14,
    paddingBottom: 6,
  },
  title: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
  },
  label: {
    flex: 1,
    fontSize: 15,
  },
});
