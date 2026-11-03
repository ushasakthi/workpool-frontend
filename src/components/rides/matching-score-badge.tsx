import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPercent } from '@/utils/formatters';
import { getMatchTier } from '@/utils/match';

interface MatchingScoreBadgeProps {
  // 0-1
  score: number;
}

// percentage + bars + word, so the score never relies on colour alone
export function MatchingScoreBadge({ score }: MatchingScoreBadgeProps) {
  const theme = useTheme();
  const tier = getMatchTier(score);

  return (
    <View style={styles.row}>
      <View style={[styles.pill, { backgroundColor: theme.accentSoft }]}>
        <ThemedText type="smallBold" themeColor="accent">
          {formatPercent(score)} match
        </ThemedText>
      </View>
      <SignalBars filled={tier.bars} />
      <ThemedText type="small" themeColor="textSecondary">
        {tier.label}
      </ThemedText>
    </View>
  );
}

export function SignalBars({ filled }: { filled: number }) {
  const theme = useTheme();

  return (
    <View style={styles.bars}>
      {[1, 2, 3, 4, 5].map((bar) => (
        <View
          key={bar}
          style={[
            styles.bar,
            {
              height: 4 + bar * 3,
              backgroundColor: bar <= filled ? theme.accent : theme.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pill: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    width: 4,
    borderRadius: 1,
  },
});
