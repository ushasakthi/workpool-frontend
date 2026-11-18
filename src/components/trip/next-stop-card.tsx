import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/admin/avatar';
import { ThemedText } from '@/components/themed-text';
import { TrustScoreBadge } from '@/components/trust/trust-score-badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TripStop } from '@/types/trip.types';

interface NextStopCardProps {
  // next rider to pick up; null once everyone is on board
  stop: TripStop | null;
  // next rider to drop off; null once everyone is out
  dropOff: TripStop | null;
  // the ride's end, shown after the last drop-off
  endLabel: string;
  ridersOnBoard: number;
  onEnterPin: (bookingId: string) => void;
  droppingOffId: string | null;
  onDropOff: (bookingId: string) => void;
}

// the hero card on the driver's trip screen: pickups first, then drop-offs, then the end
export function NextStopCard({
  stop,
  dropOff,
  endLabel,
  ridersOnBoard,
  onEnterPin,
  droppingOffId,
  onDropOff,
}: NextStopCardProps) {
  const theme = useTheme();
  const cardStyle = [styles.card, { backgroundColor: theme.background, borderColor: theme.primarySoft }];

  if (!stop) {
    return (
      <View style={cardStyle}>
        <View style={styles.row}>
          <View style={[styles.flagCircle, { backgroundColor: theme.accentSoft }]}>
            <SymbolView name={Icons.flag} size={22} tintColor={theme.accent} />
          </View>
          <View style={styles.grow}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {dropOff ? `Drop off ${dropOff.passenger.name}` : 'End of ride'}
            </ThemedText>
            <ThemedText style={styles.big}>{dropOff ? dropOff.dropOffLabel : endLabel}</ThemedText>
            <View style={styles.row}>
              <SymbolView name={Icons.people} size={16} tintColor={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                {ridersOnBoard} rider{ridersOnBoard === 1 ? '' : 's'} on board
              </ThemedText>
            </View>
          </View>
        </View>
        {dropOff && (
          <Button
            label="Drop off"
            icon="check"
            loading={droppingOffId === dropOff.bookingId}
            onPress={() => onDropOff(dropOff.bookingId)}
          />
        )}
      </View>
    );
  }

  return (
    <View style={cardStyle}>
      <View style={styles.row}>
        <Avatar name={stop.passenger.name} size={44} />
        <ThemedText style={[styles.name, styles.grow]}>{stop.passenger.name}</ThemedText>
        <TrustScoreBadge score={stop.passenger.trustScore} compact />
      </View>
      <View style={styles.details}>
        <View style={styles.row}>
          <SymbolView name={Icons.mapPin} size={18} tintColor={theme.accent} />
          <ThemedText type="smallBold">{stop.pickupLabel}</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary" style={styles.indent}>
          {stop.seats} seat{stop.seats === 1 ? '' : 's'}
        </ThemedText>
      </View>
      <Button label="Enter PIN" icon="lock" onPress={() => onEnterPin(stop.bookingId)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  flagCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  grow: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: 700,
  },
  big: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 800,
  },
  details: {
    gap: Spacing.one,
  },
  indent: {
    paddingLeft: 26,
  },
});
