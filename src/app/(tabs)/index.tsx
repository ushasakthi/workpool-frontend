import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GreetingHeader } from '@/components/home/greeting-header';
import { NextTripCard } from '@/components/home/next-trip-card';
import { PassengerTripCard } from '@/components/home/passenger-trip-card';
import { QuickActions } from '@/components/home/quick-actions';
import { RidingNowCard } from '@/components/home/riding-now-card';
import { StartTripCard } from '@/components/home/start-trip-card';
import { TripCompleteCard } from '@/components/home/trip-complete-card';
import { SavingsCard } from '@/components/home/savings-card';
import { SetupChecklist, type ChecklistItem } from '@/components/home/setup-checklist';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { useApiImageSource } from '@/hooks/use-api-image';
import { useClock } from '@/hooks/use-clock';
import { useAuthStore } from '@/stores/useAuthStore';
import { useBookingStore } from '@/stores/useBookingStore';
import { useRideStore } from '@/stores/useRideStore';
import { useTripStore } from '@/stores/useTripStore';
import { useVehicleStore } from '@/stores/useVehicleStore';
import { getErrorMessage } from '@/utils/errors';
import { findNextTrip, firstName, greetingFor } from '@/utils/home';
import { findStartableRide, findTripToRate, isBookedToday } from '@/utils/trip';
import { TRAVEL_STEPS, travelStepsDone } from '@/utils/travel';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const photo = useApiImageSource(user?.photoUrl);

  const myBookings = useBookingStore((state) => state.myBookings);
  const requests = useBookingStore((state) => state.requests);
  const savings = useBookingStore((state) => state.savings);
  const loadMyBookings = useBookingStore((state) => state.loadMyBookings);
  const loadRequests = useBookingStore((state) => state.loadRequests);
  const loadSavings = useBookingStore((state) => state.loadSavings);
  const myRides = useRideStore((state) => state.rides);
  const loadRides = useRideStore((state) => state.load);
  const vehicles = useVehicleStore((state) => state.vehicles);
  const loadVehicles = useVehicleStore((state) => state.load);
  const currentTrip = useTripStore((state) => state.current);
  const todayRides = useTripStore((state) => state.today);
  const loadCurrentTrip = useTripStore((state) => state.loadCurrent);
  const loadTodayRides = useTripStore((state) => state.loadToday);
  const startTrip = useTripStore((state) => state.start);
  // re-renders every 30 s, so "You can start from 7:30" turns into a live button
  const now = useClock(30_000);

  const [tripError, setTripError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [savingsError, setSavingsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const role = user?.role;
  const canBook = role === UserRole.PASSENGER || role === UserRole.BOTH;
  const canOffer = role === UserRole.DRIVER || role === UserRole.BOTH;

  const loadTrips = useCallback(async () => {
    setTripError(null);
    const loads: Promise<void>[] = [loadCurrentTrip()];
    if (canBook) loads.push(loadMyBookings());
    if (canOffer) loads.push(loadRides(), loadRequests(), loadTodayRides());
    try {
      await Promise.all(loads);
    } catch (err) {
      setTripError(getErrorMessage(err));
    }
  }, [
    canBook,
    canOffer,
    loadMyBookings,
    loadRides,
    loadRequests,
    loadCurrentTrip,
    loadTodayRides,
  ]);

  const loadThisMonth = useCallback(async () => {
    setSavingsError(null);
    try {
      await loadSavings();
    } catch (err) {
      setSavingsError(getErrorMessage(err));
    }
  }, [loadSavings]);

  // everything Home shows; errors are handled per card inside each load
  const loadAll = useCallback(async () => {
    const loads = [loadTrips(), loadThisMonth()];
    // only feeds the checklist, so a failure just hides that row
    if (canOffer) loads.push(loadVehicles().catch(() => undefined));
    await Promise.all(loads);
  }, [canOffer, loadTrips, loadThisMonth, loadVehicles]);

  // reload every time Home is opened, so new bookings and rides show up
  useFocusEffect(
    useCallback(() => {
      if (!role) return;
      void loadAll();
    }, [role, loadAll]),
  );

  // while a trip runs (or I'm booked for today), keep the trip card fresh every 20 s
  const watchingTrip = currentTrip !== null || isBookedToday(myBookings, now);
  useFocusEffect(
    useCallback(() => {
      if (!watchingTrip) return;
      const timer = setInterval(() => {
        void loadCurrentTrip().catch(() => undefined);
        // picks up "Trip complete" once the driver finishes
        if (canBook) void loadMyBookings().catch(() => undefined);
      }, 20_000);
      return () => clearInterval(timer);
    }, [watchingTrip, canBook, loadCurrentTrip, loadMyBookings]),
  );

  async function handleStart(rideId: string) {
    setStartError(null);
    setStarting(true);
    try {
      await startTrip(rideId);
      router.push('/bookings/trip');
      void loadTodayRides();
    } catch (err) {
      setStartError(getErrorMessage(err));
    } finally {
      setStarting(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }

  if (!user) {
    return (
      <Screen underTabBar>
        <HomeSkeleton />
      </Screen>
    );
  }

  const tripsLoading =
    (canBook && myBookings === null) || (canOffer && (myRides === null || requests === null));
  const nextTrip = findNextTrip(
    canBook ? myBookings : null,
    canOffer ? myRides : null,
    canOffer ? requests : null,
  );

  const startable = canOffer ? findStartableRide(todayRides, now) : null;
  const tripToRate = canBook ? findTripToRate(myBookings, now) : null;

  const savingsSides: ('passenger' | 'driver')[] = [];
  if (canBook) savingsSides.push('passenger');
  if (canOffer) savingsSides.push('driver');

  const checklist: ChecklistItem[] = [
    {
      label: 'Travel profile',
      done: travelStepsDone(user.travelProfile) === TRAVEL_STEPS,
      onPress: () => router.push('/commute/travel-profile'),
    },
  ];
  // wait for vehicles to load, so the row doesn't flash "to do"
  if (canOffer && vehicles !== null) {
    checklist.push({
      label: 'Add a vehicle',
      done: vehicles.length > 0,
      onPress: () => router.push('/commute/vehicle'),
    });
  }

  return (
    <Screen underTabBar refreshing={refreshing} onRefresh={() => void handleRefresh()}>
      <GreetingHeader
        greeting={greetingFor()}
        name={firstName(user.name)}
        photo={photo}
        onAvatarPress={() => router.push('/profile')}
      />

      {/* finished earlier today and not rated yet; sits above the next trip */}
      {tripToRate && (
        <TripCompleteCard
          driverName={firstName(tripToRate.otherParty.name)}
          onRate={() =>
            router.push({ pathname: '/bookings/review', params: { bookingId: tripToRate.id } })
          }
        />
      )}

      {/* one trip card: riding now, then today's Start trip, then the normal next trip */}
      {currentTrip?.side === 'driver' ? (
        <RidingNowCard trip={currentTrip} onPress={() => router.push('/bookings/trip')} />
      ) : currentTrip?.side === 'passenger' ? (
        <PassengerTripCard trip={currentTrip} onPress={() => router.push('/bookings/trip')} />
      ) : startable ? (
        <StartTripCard
          ride={startable}
          now={now}
          starting={starting}
          error={startError}
          onStart={() => void handleStart(startable.rideId)}
        />
      ) : (
        (canBook || canOffer) && (
        <NextTripCard
          trip={nextTrip}
          loading={tripsLoading}
          error={tripError}
          showSide={canBook && canOffer}
          onPress={() =>
            router.push(nextTrip?.side === 'driver' ? '/bookings/requests' : '/bookings')
          }
          onRetry={() => void loadTrips()}
        />
        )
      )}

      <QuickActions
        onFind={canBook ? () => router.push('/rides/search') : undefined}
        onOffer={canOffer ? () => router.push('/rides/post') : undefined}
        onSwitchRole={canOffer ? undefined : () => router.push('/profile')}
      />

      {savingsSides.length > 0 && (
        <SavingsCard
          savings={savings}
          error={savingsError}
          sides={savingsSides}
          onOpen={() => router.push('/profile/savings')}
          onRetry={() => void loadThisMonth()}
        />
      )}

      <SetupChecklist items={checklist} />
    </Screen>
  );
}

function HomeSkeleton() {
  return (
    <>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonText}>
          <Skeleton width={110} height={14} />
          <Skeleton width={180} height={30} />
        </View>
        <Skeleton circle height={44} />
      </View>
      <Skeleton height={260} radius={Spacing.three} />
      <View style={styles.skeletonTiles}>
        <Skeleton width="48%" height={84} radius={Spacing.three} />
        <Skeleton width="48%" height={84} radius={Spacing.three} />
      </View>
      <Skeleton height={200} radius={Spacing.three} />
    </>
  );
}

const styles = StyleSheet.create({
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skeletonText: {
    gap: 10,
  },
  skeletonTiles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
