import { ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/admin/avatar';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AdminAccountScreen() {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="smallBold" style={styles.pageTitle}>
        My profile
      </ThemedText>

      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={styles.profileHeader}>
          <Avatar name={user.name} size={48} />
          <View>
            <ThemedText type="smallBold">{user.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Administrator
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoRow}>
          <ThemedText themeColor="textSecondary">Email</ThemedText>
          <ThemedText style={styles.infoValue}>{user.email}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText themeColor="textSecondary">Phone</ThemedText>
          <ThemedText style={styles.infoValue}>{user.phone}</ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    maxWidth: 560,
  },
  pageTitle: {
    fontSize: 18,
  },
  card: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  infoValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
});
