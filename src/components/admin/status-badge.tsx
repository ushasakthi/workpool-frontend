import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { VerificationStatus } from '@/constants/verification-status.enum';
import { useTheme } from '@/hooks/use-theme';

export type BadgeTone = 'pending' | 'verified' | 'rejected' | 'neutral';

interface StatusBadgeProps {
  label: string;
  tone: BadgeTone;
}

const TONE_BY_STATUS: Record<VerificationStatus, BadgeTone> = {
  [VerificationStatus.PENDING]: 'pending',
  [VerificationStatus.VERIFIED]: 'verified',
  [VerificationStatus.REJECTED]: 'rejected',
};

export function statusBadgeTone(status: VerificationStatus): BadgeTone {
  return TONE_BY_STATUS[status];
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const theme = useTheme();

  const backgroundColor: Record<BadgeTone, string> = {
    pending: theme.warningSoft,
    verified: theme.primarySoft,
    rejected: theme.errorSoft,
    neutral: theme.backgroundElement,
  };
  const textColor: Record<BadgeTone, string> = {
    pending: theme.warning,
    verified: theme.primarySoftText,
    rejected: theme.error,
    neutral: theme.textSecondary,
  };

  return (
    <View style={[styles.pill, { backgroundColor: backgroundColor[tone] }]}>
      <ThemedText type="small" style={[styles.label, { color: textColor[tone] }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  label: {
    fontWeight: '600',
  },
});
