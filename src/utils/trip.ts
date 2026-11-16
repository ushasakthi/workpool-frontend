import { BookingStatus } from '@/constants/booking-status.enum';
import type { BookingListItem } from '@/types/booking.types';
import type {
  DriverTrip,
  PassengerTrip,
  TimelineStep,
  TodayRide,
  TripStop,
} from '@/types/trip.types';
import { formatClockTime } from '@/utils/formatters';
import { dateKey, firstName } from '@/utils/home';

const HOUR_MS = 60 * 60 * 1000;

// today's ride the driver can still start: not started yet, and not more than
// an hour past its departure (canStartAt is 30 min before departure)
export function findStartableRide(today: TodayRide[] | null, now: Date): TodayRide | null {
  return (
    today?.find(
      (ride) =>
        ride.tripStatus === null &&
        new Date(ride.canStartAt).getTime() + 1.5 * HOUR_MS > now.getTime(),
    ) ?? null
  );
}

export function pickedUpCount(trip: DriverTrip): number {
  return trip.stops.filter((stop) => stop.pickedUpAt).length;
}

// stops are already in pickup order, so the next one is the first not picked up
export function nextStop(trip: DriverTrip): TripStop | null {
  return trip.stops.find((stop) => !stop.pickedUpAt) ?? null;
}

// "Toyota Aqua · CAB-4521", or null if the car couldn't be loaded
export function vehicleLabel(trip: PassengerTrip): string | null {
  const { vehicle } = trip;
  return vehicle ? `${vehicle.make} ${vehicle.model} · ${vehicle.plateNumber}` : null;
}

// the passenger's steps: started → on the way / picked up → arrived
export function passengerTimeline(trip: PassengerTrip): TimelineStep[] {
  const driver = firstName(trip.driver.name);
  const destination = trip.destination.label ?? 'Destination';
  const started: TimelineStep = {
    label: `${driver} started`,
    time: formatClockTime(trip.startedAt),
    state: 'done',
  };
  const arrived: TimelineStep = { label: `Arrived · ${destination}`, state: 'todo' };

  if (trip.booking.pickedUpAt) {
    return [
      started,
      { label: 'Picked up', time: formatClockTime(trip.booking.pickedUpAt), state: 'done' },
      { label: `On the way to ${destination}`, state: 'current' },
      arrived,
    ];
  }
  return [
    started,
    {
      label: 'On the way to you',
      note: `You're stop ${trip.stopNumber} of ${trip.stopCount}`,
      state: 'current',
    },
    { label: 'Picked up', state: 'todo' },
    arrived,
  ];
}

// an accepted seat for today: the driver may start any moment
export function isBookedToday(myBookings: BookingListItem[] | null, now: Date): boolean {
  return (
    myBookings?.some(
      (booking) =>
        booking.status === BookingStatus.ACCEPTED && booking.travelDate === dateKey(now),
    ) ?? false
  );
}

// a trip that finished today and still needs a rating (Home "Trip complete" card)
export function findTripToRate(
  myBookings: BookingListItem[] | null,
  now: Date,
): BookingListItem | null {
  return (
    myBookings?.find(
      (booking) =>
        booking.status === BookingStatus.COMPLETED &&
        !booking.reviewedByMe &&
        booking.travelDate === dateKey(now),
    ) ?? null
  );
}
