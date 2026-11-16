import { StyleSheet, View } from 'react-native';

import { RideRoute } from '@/components/rides/ride-route';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { PastDrive } from '@/utils/bookings';
import { formatTravelDate } from '@/utils/formatters';

interface PastDriveCardProps {
  drive: PastDrive;
  onRate: (bookingId: string) => void;
}

// one day I drove: the route, then each rider with Rate (or Rated)
export function PastDriveCard({ drive, onRate }: PastDriveCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { borderColor: theme.border }]}>
      <ThemedText type="smallBold">{formatTravelDate(drive.date)}</ThemedText>
      <RideRoute ride={drive.ride} />
      <View style={[styles.riders, { borderTopColor: theme.border }]}>
        {drive.riders.map((rider) => (
          <View key={rider.id} style={styles.row}>
            <ThemedText type="small" style={styles.grow}>
              {rider.otherParty.name}
            </ThemedText>
            {rider.reviewedByMe ? (
              <ThemedText type="small" themeColor="textSecondary">
                Rated
              </ThemedText>
            ) : (
              <Button label="Rate" variant="text" onPress={() => onRate(rider.id)} />
            )}
          </View>
        ))}
      </View>
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
  riders: {
    borderTopWidth: 1,
    paddingTop: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  grow: {
    flex: 1,
  },
});
