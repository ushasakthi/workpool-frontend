import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BookingStatusTag } from '@/components/bookings/booking-status-tag';
import { PickedUpRow, PickupPin } from '@/components/bookings/pickup-status';
import { SosButton } from '@/components/bookings/sos-button';
import { RideRoute } from '@/components/rides/ride-route';
import { ThemedText } from '@/components/themed-text';
import { BookingStatus } from '@/constants/booking-status.enum';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { BookingListItem } from '@/types/booking.types';
import { formatCost, formatDate, formatTravelDate } from '@/utils/formatters';
import { formatDays } from '@/utils/schedule';

interface BookingCardProps {
  booking: BookingListItem;
  onOpenProfile: () => void;
  // shown on accepted bookings only
  onSos?: () => void;
  // optional footer, e.g. the cancel button
  children?: ReactNode;
}

// passenger view of one booking
export function BookingCard({ booking, onOpenProfile, onSos, children }: BookingCardProps) {
  const theme = useTheme();
  const driverName = booking.otherParty.name;
  const firstName = driverName.split(' ')[0];
  const seats = booking.seatsRequested;

  const note =
    booking.status === BookingStatus.REQUESTED
      ? `Waiting for ${firstName} to confirm.`
      : booking.status === BookingStatus.REJECTED
        ? 'Try another ride at a similar time.'
        : null;

  return (
    <View style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <ThemedText type="smallBold">
          {booking.travelDate
            ? formatTravelDate(booking.travelDate)
            : booking.completedAt
              ? formatDate(booking.completedAt)
              : formatDays(booking.ride.daysOfWeek)}
        </ThemedText>
        <BookingStatusTag status={booking.status} />
      </View>

      <View style={styles.routeRow}>
        <View style={styles.grow}>
          <RideRoute ride={booking.ride} />
        </View>
        {onSos && booking.status === BookingStatus.ACCEPTED && <SosButton onPress={onSos} />}
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.footerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${driverName}'s profile`}
          onPress={onOpenProfile}>
          <ThemedText type="smallBold">
            {driverName}
            <ThemedText type="small" themeColor="textSecondary">
              {` · ${seats} seat${seats === 1 ? '' : 's'}`}
            </ThemedText>
          </ThemedText>
        </Pressable>
        <ThemedText type="smallBold">{formatCost(booking.ride.costContribution * seats)}</ThemedText>
      </View>

      {note && (
        <ThemedText type="small" themeColor="textSecondary">
          {note}
        </ThemedText>
      )}

      {booking.status === BookingStatus.ACCEPTED && booking.pickupPin && (
        <PickupPin pin={booking.pickupPin} />
      )}
      {booking.status === BookingStatus.ACCEPTED && booking.pickupVerifiedAt && (
        <PickedUpRow at={booking.pickupVerifiedAt} />
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  grow: {
    flex: 1,
  },
  divider: {
    height: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
