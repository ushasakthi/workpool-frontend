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

// a booking's own day ("2026-11-19") at the ride's time; local time, like the rest of Home
function travelDateAt(travelDate: string, departureTime: string): Date {
  return new Date(`${travelDate}T${timeOfDayFromISO(departureTime)}:00`);
}

// "2026-11-19" for a local date
export function dateKey(at: Date): string {
  const month = String(at.getMonth() + 1).padStart(2, '0');
  const day = String(at.getDate()).padStart(2, '0');
  return `${at.getFullYear()}-${month}-${day}`;
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
    // older bookings have no travel date, so fall back to the next weekly run
    if (booking.travelDate) {
      if (booking.travelDate < dateKey(now)) continue;
      trips.push({
        side: 'passenger',
        at: travelDateAt(booking.travelDate, booking.ride.departureTime),
        booking,
      });
    } else {
      trips.push({ side: 'passenger', at: nextDeparture(booking.ride, now), booking });
    }
  }

  for (const ride of myRides ?? []) {
    if (ride.status !== RideStatus.ACTIVE) continue;
    const at = nextDeparture(ride, now);
    const onRide = (requests ?? []).filter((item) => item.rideId === ride.id);
    // seats are counted per day, so only that next run's bookings
    const seatsTaken = onRide
      .filter((item) => item.status === BookingStatus.ACCEPTED && item.travelDate === dateKey(at))
      .reduce((sum, item) => sum + item.seatsRequested, 0);
    const waiting = onRide.filter((item) => item.status === BookingStatus.REQUESTED).length;
    trips.push({ side: 'driver', at, ride, seatsTaken, waiting });
  }

  trips.sort((a, b) => a.at.getTime() - b.at.getTime());
  return trips[0] ?? null;
}
