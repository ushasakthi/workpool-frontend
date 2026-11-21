import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { StatusPill } from '@/components/ui/status-pill';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { VerificationStatus } from '@/constants/verification-status.enum';
import { useTheme } from '@/hooks/use-theme';
import type { VerificationInfo } from '@/types/user.types';
import { getVerificationStatusDisplay } from '@/utils/verification';

interface VerificationStatusCardProps {
  verification: VerificationInfo;
}

export function VerificationStatusCard({ verification }: VerificationStatusCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { borderColor: theme.border }]}>
      <StatusRow
        icon="shieldCheck"
        label="Identity"
        status={verification.identityStatus}
      />
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <StatusRow
        icon="briefcase"
        label="Workplace"
        status={verification.workplaceStatus}
      />
    </View>
  );
}

function StatusRow({
  icon,
  label,
  status,
}: {
  icon: keyof typeof Icons;
  label: string;
  status: VerificationStatus;
}) {
  const theme = useTheme();
  const display = getVerificationStatusDisplay(status);

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <SymbolView name={Icons[icon]} size={20} tintColor={theme.textSecondary} />
        <ThemedText type="smallBold">{label}</ThemedText>
      </View>
      <StatusPill label={display.label} tone={display.tone} icon={display.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.three,
  },
});
