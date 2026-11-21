import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BookingCard } from '@/components/bookings/booking-card';
import { BookingsSegment } from '@/components/bookings/bookings-segment';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { StateMessage } from '@/components/ui/state-message';
import { BookingStatus } from '@/constants/booking-status.enum';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { useAuthStore } from '@/stores/useAuthStore';
import { useBookingStore } from '@/stores/useBookingStore';
import type { BookingListItem } from '@/types/booking.types';
import { isInPastWeeks, isUpcoming } from '@/utils/bookings';
import { getErrorMessage } from '@/utils/errors';

export default function MyBookingsScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const bookings = useBookingStore((state) => state.myBookings);
  const load = useBookingStore((state) => state.loadMyBookings);
  const cancel = useBookingStore((state) => state.cancel);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // reload every time the tab is opened, so a request made a moment ago shows up
  useFocusEffect(
    useCallback(() => {
      if (role === UserRole.DRIVER) return;
      setLoadError(null);
      void load().catch((err) => setLoadError(getErrorMessage(err)));
    }, [role, load]),
  );

  // drivers only answer requests, they don't book
  if (role === UserRole.DRIVER) {
    return <Redirect href="/bookings/requests" />;
  }

  async function confirmCancel(booking: BookingListItem) {
    setActionError(null);
    setBusyId(booking.id);
    try {
      await cancel(booking.id);
      setConfirmId(null);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  function openProfile(userId: string) {
    router.push({ pathname: '/profile/[userId]', params: { userId } });
  }

  function openReport(bookingId: string) {
    router.push({ pathname: '/bookings/report', params: { bookingId } });
  }

  const upcoming = bookings?.filter(isUpcoming) ?? [];
  const now = new Date();
  const past =
    bookings?.filter((booking) => !isUpcoming(booking) && isInPastWeeks(booking, now)) ?? [];

  return (
    <Screen
      header={role === UserRole.BOTH ? <BookingsSegment active="mine" /> : undefined}
      underTabBar>
      <ThemedText type="title" style={styles.title}>
        My bookings
      </ThemedText>

      {actionError && <Banner message={actionError} />}

      {bookings === null ? (
        loadError ? (
          <StateMessage
            icon="wifiSlash"
            tone="error"
            title="Couldn't load your bookings"
            message={loadError}
            action={{
              label: 'Try again',
              variant: 'soft',
              onPress: () => {
                setLoadError(null);
                void load().catch((err) => setLoadError(getErrorMessage(err)));
              },
            }}
          />
        ) : (
          <>
            <Skeleton height={190} radius={Spacing.four} />
            <Skeleton height={190} radius={Spacing.four} />
          </>
        )
      ) : bookings.length === 0 ? (
        <EmptyState onFind={() => router.push('/rides/search')} />
      ) : (
        <>
          {upcoming.length > 0 && <SectionLabel label="Upcoming" />}
          {upcoming.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onOpenProfile={() => openProfile(booking.otherParty.id)}>
              {canCancel(booking) && (
                <CancelFooter
                  confirming={confirmId === booking.id}
                  busy={busyId === booking.id}
                  onAsk={() => setConfirmId(booking.id)}
                  onKeep={() => setConfirmId(null)}
                  onConfirm={() => void confirmCancel(booking)}
                />
              )}
              {canReport(booking) && (
                <Button label="Report an issue" variant="text" onPress={() => openReport(booking.id)} />
              )}
            </BookingCard>
          ))}

          {past.length > 0 && <SectionLabel label="Past" />}
          {past.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onOpenProfile={() => openProfile(booking.otherParty.id)}>
              {booking.status === BookingStatus.COMPLETED && !booking.reviewedByMe && (
                <Button
                  label="Rate your ride"
                  variant="soft"
                  onPress={() =>
                    router.push({ pathname: '/bookings/review', params: { bookingId: booking.id } })
                  }
                />
              )}
              {canReport(booking) && (
                <Button label="Report an issue" variant="text" onPress={() => openReport(booking.id)} />
              )}
            </BookingCard>
          ))}
        </>
      )}
    </Screen>
  );
}

// once the two of you have actually been matched
function canReport(booking: BookingListItem): boolean {
  return [BookingStatus.ACCEPTED, BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(
    booking.status,
  );
}

function canCancel(booking: BookingListItem): boolean {
  return (
    booking.status === BookingStatus.REQUESTED || booking.status === BookingStatus.ACCEPTED
  );
}

function CancelFooter({
  confirming,
  busy,
  onAsk,
  onKeep,
  onConfirm,
}: {
  confirming: boolean;
  busy: boolean;
  onAsk: () => void;
  onKeep: () => void;
  onConfirm: () => void;
}) {
  if (!confirming) {
    return <Button label="Cancel booking" variant="text" onPress={onAsk} />;
  }
  return (
    <View style={styles.confirmRow}>
      <ThemedText type="smallBold" style={styles.grow}>
        Cancel this booking?
      </ThemedText>
      <Button label="Keep" variant="text" disabled={busy} onPress={onKeep} />
      <Button label="Yes, cancel" variant="danger" loading={busy} onPress={onConfirm} />
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <ThemedText type="smallBold" themeColor="textSecondary">
      {label}
    </ThemedText>
  );
}

function EmptyState({ onFind }: { onFind: () => void }) {
  return (
    <StateMessage
      icon="car"
      title="You haven't booked a ride yet"
      message="Find a coworker heading your way and request a seat."
      action={{ label: 'Find a ride', trailingArrow: true, onPress: onFind }}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  grow: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
