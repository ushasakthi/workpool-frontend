import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AdminMaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AdminLayout() {
  const theme = useTheme();

  return (
    <View style={[styles.page, { backgroundColor: theme.backgroundElement }]}>
      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.five,
  },
  card: {
    flex: 1,
    width: '100%',
    maxWidth: AdminMaxContentWidth,
    borderRadius: Spacing.four,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
