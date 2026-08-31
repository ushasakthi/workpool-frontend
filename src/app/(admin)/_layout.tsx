import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { useTheme } from '@/hooks/use-theme';

export default function AdminLayout() {
  const theme = useTheme();

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
