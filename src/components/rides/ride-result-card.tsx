import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { MatchingScoreBadge } from '@/components/rides/matching-score-badge';
import { RideRoute } from '@/components/rides/ride-route';
import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { VerificationStatus } from '@/constants/verification-status.enum';
import { useTheme } from '@/hooks/use-theme';
import type { RideMatch } from '@/types/ride.types';
import { formatCost, formatDistance, formatSeatsPerDay, shortName } from '@/utils/formatters';
import { getOverallVerificationStatus } from '@/utils/verification';

interface RideResultCardProps {
  ride: RideMatch;
  onPress: () => void;
}

// one search result: match score, shared cost, route and driver
export function RideResultCard({ ride, onPress }: RideResultCardProps) {
  const theme = useTheme();
  const { identityStatus, workplaceStatus } = ride.driver.verification;
  const isVerified =
    getOverallVerificationStatus(identityStatus, workplaceStatus) === VerificationStatus.VERIFIED;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <View style={styles.topRow}>
        <MatchingScoreBadge score={ride.match.score} />
        <View style={styles.cost}>
          <ThemedText style={styles.costAmount}>{formatCost(ride.costContribution)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            your share
          </ThemedText>
        </View>
      </View>

      <RideRoute
        ride={ride}
        pickupNote={
          ride.pickupDistanceKm === null
            ? undefined
            : `Passes ${formatDistance(ride.pickupDistanceKm)} from your home`
        }
      />

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.footer}>
        <View style={styles.driver}>
          <SymbolView name={Icons.person} size={16} tintColor={theme.textSecondary} />
          <ThemedText type="smallBold">{shortName(ride.driver.name)}</ThemedText>
          {isVerified && (
            <SymbolView name={Icons.checkCircle} size={14} tintColor={theme.primary} />
          )}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {formatSeatsPerDay(ride.seatsAvailable)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cost: {
    alignItems: 'flex-end',
  },
  costAmount: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  divider: {
    height: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driver: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
