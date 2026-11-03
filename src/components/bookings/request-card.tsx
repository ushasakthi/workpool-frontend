import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/admin/avatar';
import { PickedUpRow } from '@/components/bookings/pickup-status';
import { SosButton } from '@/components/bookings/sos-button';
import { ThemedText } from '@/components/themed-text';
import { TrustScoreBadge } from '@/components/trust/trust-score-badge';
import { Button } from '@/components/ui/button';
import { BookingStatus } from '@/constants/booking-status.enum';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { BookingListItem } from '@/types/booking.types';
import { formatCost } from '@/utils/formatters';

export type RequestAction = 'accept' | 'decline' | 'complete';

interface RequestCardProps {
  request: BookingListItem;
  // which button is waiting on the server, null = none
  busy: RequestAction | null;
  onAction: (action: RequestAction) => void;
  onReport: () => void;
  onVerifyPickup: () => void;
  onSos: () => void;
  onOpenProfile: () => void;
}

// driver view of one booking on their ride
export function RequestCard({
  request,
  busy,
  onAction,
  onReport,
  onVerifyPickup,
  onSos,
  onOpenProfile,
}: RequestCardProps) {
  const theme = useTheme();
  const seats = request.seatsRequested;
  const seatsLeft = request.ride.seatsAvailable;
  const cantFit = seats > seatsLeft;

  return (
    <View style={[styles.card, { borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${request.otherParty.name}'s profile`}
        onPress={onOpenProfile}
        style={styles.personRow}>
        <Avatar name={request.otherParty.name} size={44} />
        <ThemedText type="smallBold" style={styles.grow}>
          {request.otherParty.name}
        </ThemedText>
        <TrustScoreBadge score={request.otherParty.trustScore} />
      </Pressable>

      <View style={styles.detailsRow}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.grow}>
          <ThemedText type="smallBold">{`${seats} seat${seats === 1 ? '' : 's'}`}</ThemedText>
          {` · ${formatCost(request.ride.costContribution * seats)} · Pickup ${request.ride.origin.label ?? ''}`}
        </ThemedText>
        {request.status === BookingStatus.ACCEPTED && <SosButton onPress={onSos} />}
      </View>

      {request.status === BookingStatus.REQUESTED && (
        <>
          {cantFit && (
            <ThemedText type="small" themeColor="textSecondary">
              Only {seatsLeft} seat{seatsLeft === 1 ? '' : 's'} left — can&apos;t fit {seats}.
            </ThemedText>
          )}
          {/* both buttons lock while either one is waiting, so a double-tap can't send twice */}
          <View style={styles.actions}>
            <View style={styles.grow}>
              <Button
                label="Decline"
                variant="soft"
                loading={busy === 'decline'}
                disabled={busy !== null}
                onPress={() => onAction('decline')}
              />
            </View>
            <View style={styles.grow}>
              <Button
                label="Accept"
                loading={busy === 'accept'}
                disabled={busy !== null || cantFit}
                onPress={() => onAction('accept')}
              />
            </View>
          </View>
        </>
      )}

      {request.status === BookingStatus.ACCEPTED && request.pickupVerifiedAt && (
        <PickedUpRow at={request.pickupVerifiedAt} />
      )}

      {/* the ride can only be completed after the PIN check at pickup */}
      {request.status === BookingStatus.ACCEPTED && (
        <View style={styles.actions}>
          <View style={styles.grow}>
            <Button label="Report" variant="soft" disabled={busy !== null} onPress={onReport} />
          </View>
          <View style={styles.grow}>
            {request.pickupVerifiedAt ? (
              <Button
                label="Mark completed"
                loading={busy === 'complete'}
                disabled={busy !== null}
                onPress={() => onAction('complete')}
              />
            ) : (
              <Button label="Enter pickup PIN" disabled={busy !== null} onPress={onVerifyPickup} />
            )}
          </View>
        </View>
      )}

      {request.status === BookingStatus.REJECTED && <ResultRow icon="xmarkCircle" label="Declined" />}
      {request.status === BookingStatus.COMPLETED && <ResultRow icon="flag" label="Completed" />}
    </View>
  );
}

function ResultRow({ icon, label }: { icon: keyof typeof Icons; label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.result, { backgroundColor: theme.backgroundElement }]}>
      <SymbolView name={Icons[icon]} size={16} tintColor={theme.textSecondary} />
      <ThemedText type="smallBold">{label}</ThemedText>
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
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  grow: {
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
