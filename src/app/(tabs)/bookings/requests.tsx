import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BookingsSegment } from '@/components/bookings/bookings-segment';
import { RequestCard, type RequestAction } from '@/components/bookings/request-card';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { StateMessage } from '@/components/ui/state-message';
import { BookingStatus } from '@/constants/booking-status.enum';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { useAuthStore } from '@/stores/useAuthStore';
import { useBookingStore } from '@/stores/useBookingStore';
import { groupByRide } from '@/utils/bookings';
import { getErrorMessage } from '@/utils/errors';
import { formatSeatsLeft } from '@/utils/formatters';
import { formatRideSchedule } from '@/utils/schedule';

const DRIVER_ROLES: UserRole[] = [UserRole.DRIVER, UserRole.BOTH];

export default function RideRequestsScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const requests = useBookingStore((state) => state.requests);
  const load = useBookingStore((state) => state.loadRequests);
  const accept = useBookingStore((state) => state.accept);
  const decline = useBookingStore((state) => state.decline);
  const complete = useBookingStore((state) => state.complete);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<{ id: string; action: RequestAction } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isDriver = role ? DRIVER_ROLES.includes(role) : false;

  // reload every time the tab is opened, so new requests show up
  useFocusEffect(
    useCallback(() => {
      if (!isDriver) return;
      setLoadError(null);
      void load().catch((err) => setLoadError(getErrorMessage(err)));
    }, [isDriver, load]),
  );

  if (role && !isDriver) {
    return <Redirect href="/bookings" />;
  }

  async function act(id: string, action: RequestAction) {
    setActionError(null);
    setBusy({ id, action });
    try {
      if (action === 'accept') await accept(id);
      if (action === 'decline') await decline(id);
      if (action === 'complete') {
        await complete(id);
        // the rating prompt comes straight after a completed ride
        router.push({ pathname: '/bookings/review', params: { bookingId: id } });
      }
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  const pending = requests?.filter((r) => r.status === BookingStatus.REQUESTED) ?? [];
  const groups = groupByRide(requests ?? []);
  const pendingRides = groupByRide(pending).length;

  return (
    <Screen
      header={role === UserRole.BOTH ? <BookingsSegment active="requests" /> : undefined}
      underTabBar>
      <View style={styles.heading}>
        <ThemedText type="title" style={styles.title}>
          Ride requests
        </ThemedText>
        {requests !== null && (
          <ThemedText themeColor="textSecondary">
            {pending.length === 0
              ? 'Nothing waiting on your rides'
              : `${pending.length} pending on ${pendingRides} ride${pendingRides === 1 ? '' : 's'}`}
          </ThemedText>
        )}
      </View>

      {actionError && <Banner message={actionError} />}

      {requests === null ? (
        loadError ? (
          <StateMessage
            icon="wifiSlash"
            tone="error"
            title="Couldn't load requests"
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
            <Skeleton height={170} radius={Spacing.four} />
            <Skeleton height={170} radius={Spacing.four} />
          </>
        )
      ) : requests.length === 0 ? (
        <EmptyState onViewRides={() => router.push('/rides/my-rides')} />
      ) : (
        groups.map((group) => {
          const ride = group.items[0].ride;
          return (
            <View key={group.rideId} style={styles.group}>
              <View style={styles.groupHeader}>
                <ThemedText type="smallBold">
                  {formatRideSchedule(ride.daysOfWeek, ride.departureTime)}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatSeatsLeft(ride.seatsAvailable)}
                </ThemedText>
              </View>
              {group.items.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  busy={busy?.id === request.id ? busy.action : null}
                  onAction={(action) => void act(request.id, action)}
                  onReport={() =>
                    router.push({ pathname: '/bookings/report', params: { bookingId: request.id } })
                  }
                  onOpenProfile={() =>
                    router.push({
                      pathname: '/profile/[userId]',
                      params: { userId: request.otherParty.id },
                    })
                  }
                />
              ))}
            </View>
          );
        })
      )}
    </Screen>
  );
}

function EmptyState({ onViewRides }: { onViewRides: () => void }) {
  return (
    <StateMessage
      icon="inbox"
      title="No requests yet"
      message="When a coworker asks for a seat on one of your rides, it shows up here."
      action={{ label: 'View my offered rides', variant: 'soft', onPress: onViewRides }}
    />
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  center: {
    textAlign: 'center',
  },
  group: {
    gap: Spacing.two,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
