import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';

export function OnboardingHeader() {
  const theme = useTheme();
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <View style={styles.row}>
      <View style={styles.brandRow}>
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <ThemedText type="smallBold" themeColor="onPrimary">
            WP
          </ThemedText>
        </View>
        <ThemedText type="smallBold">WorkPool</ThemedText>
      </View>
      <Pressable accessibilityRole="button" onPress={() => void clearSession()} hitSlop={8}>
        <ThemedText type="small" themeColor="textSecondary">
          Log out
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
