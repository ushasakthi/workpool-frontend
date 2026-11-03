import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface TrustScoreBadgeProps {
  // 0-100, null = not scored yet
  score: number | null;
  // one line, number only (still not colour alone)
  compact?: boolean;
}

export function trustLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Low';
}

// number + label, never colour alone
export function TrustScoreBadge({ score, compact = false }: TrustScoreBadgeProps) {
  const theme = useTheme();

  if (compact) {
    return (
      <View style={[styles.row, styles.compact, { backgroundColor: theme.primarySoft }]}>
        <SymbolView name={Icons.shieldCheck} size={14} tintColor={theme.primary} />
        <ThemedText type="smallBold" themeColor="primarySoftText">
          {score === null ? 'New' : score}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
      <View style={styles.row}>
        <SymbolView name={Icons.shieldCheck} size={16} tintColor={theme.primary} />
        <ThemedText themeColor="primarySoftText" style={styles.value}>
          {score === null ? 'New' : score}
        </ThemedText>
      </View>
      <ThemedText type="smallBold" themeColor="primarySoftText">
        {score === null ? 'Not rated yet' : trustLabel(score)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  compact: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  value: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 700,
  },
});
