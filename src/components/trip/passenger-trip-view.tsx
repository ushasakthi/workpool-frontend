import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/admin/avatar';
import { ThemedText } from '@/components/themed-text';
import { PinBox } from '@/components/trip/pin-box';
import { TripTimeline } from '@/components/trip/trip-timeline';
import { TrustScoreBadge } from '@/components/trust/trust-score-badge';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { PassengerTrip } from '@/types/trip.types';
import { formatClockTime, formatCost } from '@/utils/formatters';
import { firstName } from '@/utils/home';
import { passengerTimeline, vehicleLabel } from '@/utils/trip';

interface PassengerTripViewProps {
  trip: PassengerTrip;
  // set when the last refresh failed; the PIN stays on screen from the last load
  offlineError: string | null;
  onRetry: () => void;
  cancelling: boolean;
  cancelError: string | null;
  onCancelBooking: () => void;
}

export function PassengerTripView({
  trip,
  offlineError,
  onRetry,
  cancelling,
  cancelError,
  onCancelBooking,
}: PassengerTripViewProps) {
  const theme = useTheme();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const driver = firstName(trip.driver.name);
  const { pickupPin, pickedUpAt, seats, costContribution } = trip.booking;

  return (
    <>
      {offlineError && (
        <View style={styles.row}>
          <View style={styles.grow}>
            <Banner message="Couldn’t update the trip. Check your connection." icon="wifiSlash" />
          </View>
          <Button label="Retry" variant="text" onPress={onRetry} />
        </View>
      )}

      <View style={styles.row}>
        <Avatar name={trip.driver.name} size={48} />
        <View style={styles.grow}>
          <ThemedText style={styles.name}>{trip.driver.name}</ThemedText>
          {vehicleLabel(trip) && (
            <ThemedText type="small" themeColor="textSecondary">
              {vehicleLabel(trip)}
            </ThemedText>
          )}
        </View>
        <TrustScoreBadge score={trip.driver.trustScore} compact />
      </View>

      {pickupPin ? (
        <PinBox label={`SHOW THIS PIN TO ${driver.toUpperCase()}`} pin={pickupPin} />
      ) : (
        pickedUpAt && (
          <View style={[styles.pickedUp, { backgroundColor: theme.backgroundElement }]}>
            <SymbolView name={Icons.checkCircle} size={20} tintColor={theme.primary} />
            <ThemedText type="smallBold">Picked up at {formatClockTime(pickedUpAt)}</ThemedText>
          </View>
        )
      )}

      <TripTimeline steps={passengerTimeline(trip)} />

      <View style={[styles.details, { borderTopColor: theme.border }]}>
        <View style={[styles.detailRow, { borderBottomColor: theme.border }, styles.divided]}>
          <SymbolView name={Icons.mapPin} size={18} tintColor={theme.accent} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.grow}>
            Pickup
          </ThemedText>
          <ThemedText type="smallBold">{trip.pickupLabel}</ThemedText>
        </View>
        <View style={styles.detailRow}>
          <SymbolView name={Icons.savings} size={18} tintColor={theme.textSecondary} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.grow}>
            Cost contribution
          </ThemedText>
          <ThemedText type="smallBold">{formatCost(costContribution * seats)}</ThemedText>
        </View>
      </View>

      {/* only before pickup: once on board there's nothing to cancel */}
      {!pickedUpAt &&
        (confirmingCancel ? (
          <View style={styles.confirm}>
            <ThemedText type="small" themeColor="textSecondary">
              Cancelling now lowers your Trust Score.
            </ThemedText>
            {cancelError && (
              <ThemedText type="small" themeColor="error">
                {cancelError}
              </ThemedText>
            )}
            <View style={styles.row}>
              <View style={styles.grow}>
                <Button
                  label="Keep my seat"
                  variant="soft"
                  disabled={cancelling}
                  onPress={() => setConfirmingCancel(false)}
                />
              </View>
              <View style={styles.grow}>
                <Button
                  label="Yes, cancel"
                  variant="danger"
                  loading={cancelling}
                  onPress={onCancelBooking}
                />
              </View>
            </View>
          </View>
        ) : (
          <Button label="Can’t make it?" variant="text" onPress={() => setConfirmingCancel(true)} />
        ))}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  grow: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: 700,
  },
  pickedUp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.four,
  },
  details: {
    borderTopWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  divided: {
    borderBottomWidth: 1,
  },
  confirm: {
    gap: Spacing.two,
  },
});
