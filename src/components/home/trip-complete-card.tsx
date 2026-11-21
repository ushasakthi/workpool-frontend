import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// passenger's Home card after today's trip, until they rate the driver
export function TripCompleteCard({ driverName, onRate }: { driverName: string; onRate: () => void }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
          <SymbolView name={Icons.checkCircle} size={20} tintColor={theme.primary} />
        </View>
        <View style={styles.grow}>
          <ThemedText style={styles.title}>Trip complete</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            How was your ride with {driverName}?
          </ThemedText>
        </View>
      </View>
      <Button label={`Rate ${driverName}`} icon="star" onPress={onRate} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 800,
  },
});
