import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/admin/avatar';
import { ThemedText } from '@/components/themed-text';
import { AdminMaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';

export function AdminHeader() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [menuOpen, setMenuOpen] = useState(false);

  function goTo(path: '/account' | '/settings') {
    setMenuOpen(false);
    router.push(path);
  }

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
            accessibilityLabel="Account menu"
            onPress={() => setMenuOpen(true)}>
            <ThemedText type="small" themeColor="textSecondary">
              Signed in as <ThemedText type="smallBold">{user.name}</ThemedText>
            </ThemedText>
            <Avatar name={user.name} />
          </Pressable>
        )}
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} />
        <View style={[styles.menu, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Pressable style={styles.menuItem} onPress={() => goTo('/account')}>
            <ThemedText>Profile</ThemedText>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => goTo('/settings')}>
            <ThemedText>Settings</ThemedText>
          </Pressable>
          <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              void clearSession();
            }}>
            <ThemedText themeColor="error">Sign out</ThemedText>
          </Pressable>
        </View>
      </Modal>
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
  menu: {
    position: 'absolute',
    top: 64,
    right: Spacing.four,
    minWidth: 180,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.one,
  },
  menuItem: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  menuDivider: {
    height: 1,
    marginVertical: Spacing.one,
  },
});
