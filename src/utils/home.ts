import { BookingStatus } from '@/constants/booking-status.enum';
import { RideStatus } from '@/constants/ride-status.enum';
import type { BookingListItem } from '@/types/booking.types';
import type { Ride } from '@/types/ride.types';
import { nextOccurrence, timeOfDayFromISO } from '@/utils/schedule';

// the soonest trip for the Home card, from either side
export type NextTrip =
  | { side: 'passenger'; at: Date; booking: BookingListItem }
  | { side: 'driver'; at: Date; ride: Ride; seatsTaken: number; waiting: number };

export function greetingFor(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? '';
}

// "Today", "Tomorrow", otherwise "Mon"
export function formatTripDay(at: Date, now: Date = new Date()): string {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const dayDiff = Math.floor((at.getTime() - startOfToday.getTime()) / 86_400_000);
  if (dayDiff === 0) return 'Today';
  if (dayDiff === 1) return 'Tomorrow';
  return at.toLocaleDateString('en-US', { weekday: 'short' });
}

// rides repeat weekly, so the stored departureTime can already be in the past
function nextDeparture(ride: Pick<Ride, 'departureTime' | 'daysOfWeek'>, now: Date): Date {
  return nextOccurrence(timeOfDayFromISO(ride.departureTime), ride.daysOfWeek, now);
}

const OPEN_BOOKING: BookingStatus[] = [BookingStatus.REQUESTED, BookingStatus.ACCEPTED];

export function findNextTrip(
  myBookings: BookingListItem[] | null,
  myRides: Ride[] | null,
  requests: BookingListItem[] | null,
  now: Date = new Date(),
): NextTrip | null {
  const trips: NextTrip[] = [];

  for (const booking of myBookings ?? []) {
    if (!OPEN_BOOKING.includes(booking.status) || booking.ride.status !== RideStatus.ACTIVE) continue;
    trips.push({ side: 'passenger', at: nextDeparture(booking.ride, now), booking });
  }

  for (const ride of myRides ?? []) {
    if (ride.status !== RideStatus.ACTIVE) continue;
    const onRide = (requests ?? []).filter((item) => item.rideId === ride.id);
    const seatsTaken = onRide
      .filter((item) => item.status === BookingStatus.ACCEPTED)
      .reduce((sum, item) => sum + item.seatsRequested, 0);
    const waiting = onRide.filter((item) => item.status === BookingStatus.REQUESTED).length;
    trips.push({ side: 'driver', at: nextDeparture(ride, now), ride, seatsTaken, waiting });
  }

  trips.sort((a, b) => a.at.getTime() - b.at.getTime());
  return trips[0] ?? null;
}
