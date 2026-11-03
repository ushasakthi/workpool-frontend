import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// one card failed to load; the rest of Home keeps working
export function CardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: theme.errorSoft }]}>
      <SymbolView name={Icons.wifiSlash} size={18} tintColor={theme.error} />
      <ThemedText type="smallBold" themeColor="error" style={styles.grow}>
        {message}
      </ThemedText>
      <Pressable accessibilityRole="button" onPress={onRetry} hitSlop={8}>
        <ThemedText type="smallBold" themeColor="error">
          Retry
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  grow: {
    flex: 1,
  },
});
