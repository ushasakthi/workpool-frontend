import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/admin/avatar';
import { ThemedText } from '@/components/themed-text';
import { AdminMaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';

export function AdminHeader() {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <View style={[styles.bar, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <View style={styles.inner}>
        <View style={styles.brandRow}>
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <ThemedText type="smallBold" themeColor="onPrimary">
              WP
            </ThemedText>
          </View>
          <View style={styles.wordmarkRow}>
            <ThemedText type="smallBold">WorkPool</ThemedText>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Admin
            </ThemedText>
          </View>
        </View>

        {user && (
          <Pressable
            style={styles.accountRow}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            onPress={() => void clearSession()}>
            <ThemedText type="small" themeColor="textSecondary">
              Signed in as <ThemedText type="smallBold">{user.name}</ThemedText>
            </ThemedText>
            <Avatar name={user.name} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderBottomWidth: 1,
  },
  inner: {
    width: '100%',
    maxWidth: AdminMaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
});
