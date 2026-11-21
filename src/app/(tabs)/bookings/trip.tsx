import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DriverTripView } from '@/components/trip/driver-trip-view';
import { FinishTripSheet } from '@/components/trip/finish-trip-sheet';
import { PassengerTripView } from '@/components/trip/passenger-trip-view';
import { TripFinished } from '@/components/trip/trip-finished';
import { TripHeader } from '@/components/trip/trip-header';
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
import { useTripStore } from '@/stores/useTripStore';
import type { TripSummary } from '@/types/trip.types';
import { getErrorMessage } from '@/utils/errors';
import { firstName } from '@/utils/home';

const REFRESH_MS = 20_000;

export default function TripScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const trip = useTripStore((state) => state.current);
  const checked = useTripStore((state) => state.checked);
  const updatedAt = useTripStore((state) => state.updatedAt);
  const loadCurrent = useTripStore((state) => state.loadCurrent);
  const finish = useTripStore((state) => state.finish);
  const requests = useBookingStore((state) => state.requests);
  const pastDrives = useBookingStore((state) => state.pastDrives);
  const loadRequests = useBookingStore((state) => state.loadRequests);
  const cancelBooking = useBookingStore((state) => state.cancel);
  const completeBooking = useBookingStore((state) => state.complete);
  const myBookings = useBookingStore((state) => state.myBookings);
  const loadMyBookings = useBookingStore((state) => state.loadMyBookings);

  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [summary, setSummary] = useState<TripSummary | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [droppingOffId, setDroppingOffId] = useState<string | null>(null);
  const [dropOffError, setDropOffError] = useState<string | null>(null);
  // my seat while I'm riding, so we know which booking to rate once I'm dropped off
  const ridingBookingId = useRef<string | null>(null);

  const canDrive = role === UserRole.DRIVER || role === UserRole.BOTH;

  const refresh = useCallback(async () => {
    try {
      await loadCurrent();
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [loadCurrent]);

  // reload when the screen opens (or a PIN screen closes), and every 20 s while it stays open
  useFocusEffect(
    useCallback(() => {
      if (summary) return;
      void refresh();
      // the PIN and rating screens find the booking in this list
      if (canDrive) void loadRequests().catch(() => undefined);
      const timer = setInterval(() => void refresh(), REFRESH_MS);
      return () => clearInterval(timer);
    }, [summary, refresh, canDrive, loadRequests]),
  );

  useEffect(() => {
    if (trip?.side === 'passenger') {
      ridingBookingId.current = trip.booking.id;
    } else if (!trip && ridingBookingId.current) {
      // my trip just disappeared: reload my bookings to see how it ended
      void loadMyBookings().catch(() => undefined);
    }
  }, [trip, loadMyBookings]);

  // dropped off (booking completed) → straight to rating the driver
  useEffect(() => {
    const bookingId = ridingBookingId.current;
    if (trip || !bookingId) return;
    const mine = myBookings?.find((booking) => booking.id === bookingId);
    if (mine?.status === BookingStatus.COMPLETED && !mine.reviewedByMe) {
      ridingBookingId.current = null;
      router.replace({ pathname: '/bookings/review', params: { bookingId } });
    }
  }, [trip, myBookings, router]);

  // Home is another tab, so go there directly instead of "back"
  const goHome = () => router.navigate('/');

  async function cancelSeat(bookingId: string) {
    setCancelError(null);
    setCancelling(true);
    try {
      await cancelBooking(bookingId);
      // the trip is no longer mine, so this shows "No trip in progress"
      await refresh();
    } catch (err) {
      setCancelError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  }

  // one rider gets out on the way: their booking completes, the trip carries on
  async function dropOff(bookingId: string) {
    setDropOffError(null);
    setDroppingOffId(bookingId);
    try {
      await completeBooking(bookingId);
      await refresh();
    } catch (err) {
      setDropOffError(getErrorMessage(err));
    } finally {
      setDroppingOffId(null);
    }
  }

  async function confirmFinish(tripId: string) {
    setFinishError(null);
    setFinishing(true);
    try {
      setSummary(await finish(tripId));
      setConfirming(false);
    } catch (err) {
      setFinishError(getErrorMessage(err));
    } finally {
      setFinishing(false);
    }
  }

  if (summary) {
    // one rider at a time; the button goes once everyone is rated
    // finished bookings sit in Past rides once Ride requests reloads, so check both
    const nextToRate = summary.completedBookingIds.find(
      (id) =>
        !(requests?.find((item) => item.id === id) ?? pastDrives?.find((item) => item.id === id))
          ?.reviewedByMe,
    );
    return (
      <Screen underTabBar>
        <TripFinished
          summary={summary}
          onRate={
            nextToRate
              ? () => router.push({ pathname: '/bookings/review', params: { bookingId: nextToRate } })
              : undefined
          }
          onHome={goHome}
        />
      </Screen>
    );
  }

  if (!trip) {
    return (
      <Screen header={<TripHeader title="Trip" onClose={goHome} />} underTabBar>
        {!checked && !error ? (
          <TripSkeleton />
        ) : error ? (
          <>
            <Banner message="Couldn’t load the trip. Check your connection." icon="wifiSlash" />
            <Button label="Retry" variant="soft" onPress={() => void refresh()} />
          </>
        ) : (
          <StateMessage
            icon="car"
            title="No trip in progress"
            message="When a trip starts, you'll follow it here."
            action={{ label: 'Back to Home', variant: 'soft', onPress: goHome }}
          />
        )}
      </Screen>
    );
  }

  if (trip.side === 'passenger') {
    const bookingId = trip.booking.id;
    return (
      <Screen
        header={
          <TripHeader
            title="Your trip"
            onClose={goHome}
            onSos={() => router.push({ pathname: '/bookings/sos', params: { bookingId } })}
          />
        }
        underTabBar>
        <PassengerTripView
          trip={trip}
          offlineError={error}
          onRetry={() => void refresh()}
          cancelling={cancelling}
          cancelError={cancelError}
          onCancelBooking={() => void cancelSeat(bookingId)}
        />
      </Screen>
    );
  }

  const firstBooking = trip.stops[0]?.bookingId;
  const missed = trip.stops
    .filter((stop) => !stop.pickedUpAt)
    .map((stop) => firstName(stop.passenger.name));

  return (
    <Screen
      header={
        <TripHeader
          title="Trip in progress"
          onClose={goHome}
          onSos={
            firstBooking
              ? () => router.push({ pathname: '/bookings/sos', params: { bookingId: firstBooking } })
              : undefined
          }
        />
      }
      underTabBar>
      <DriverTripView
        trip={trip}
        offlineError={error}
        updatedAt={updatedAt}
        onRetry={() => void refresh()}
        onEnterPin={(bookingId) =>
          router.push({ pathname: '/bookings/verify-pickup', params: { bookingId } })
        }
        droppingOffId={droppingOffId}
        dropOffError={dropOffError}
        onDropOff={(bookingId) => void dropOff(bookingId)}
        onFinish={() => setConfirming(true)}
      />
      <FinishTripSheet
        visible={confirming}
        pickedUp={trip.stops.length - missed.length}
        missed={missed}
        finishing={finishing}
        error={finishError}
        onFinish={() => void confirmFinish(trip.id)}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}

function TripSkeleton() {
  return (
    <View style={styles.skeleton}>
      <Skeleton width={120} height={12} />
      <Skeleton width={220} height={20} />
      <Skeleton height={190} radius={Spacing.three} />
      <Skeleton height={20} />
      <Skeleton height={20} />
      <Skeleton height={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    gap: Spacing.three,
  },
});
