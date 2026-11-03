import { Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { useTheme } from '@/hooks/use-theme';
import { useAdminStore } from '@/stores/useAdminStore';

export default function AdminLayout() {
  const theme = useTheme();
  const pathname = usePathname();
  const loadStats = useAdminStore((state) => state.loadStats);

  // refresh the sidebar counts whenever the admin moves to another screen
  useEffect(() => {
    void loadStats().catch(() => undefined);
  }, [pathname, loadStats]);

  return (
    <View style={[styles.page, { backgroundColor: theme.backgroundElement }]}>
      <AdminSidebar />
      <View style={styles.content}>
        <AdminHeader />
        <View style={styles.stackWrapper}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  stackWrapper: {
    flex: 1,
  },
});
