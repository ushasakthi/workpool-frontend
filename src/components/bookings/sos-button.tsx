import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// small and red, never the main action: it only opens the "Need help?" sheet
export function SosButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="SOS, get help"
      onPress={onPress}
      style={[styles.pill, { backgroundColor: theme.errorSoft }]}>
      <SymbolView name={Icons.emergency} size={16} tintColor={theme.error} />
      <ThemedText type="smallBold" themeColor="error">
        SOS
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
