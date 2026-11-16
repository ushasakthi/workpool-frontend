import { BookingStatus } from '@/constants/booking-status.enum';
import type { BookingListItem } from '@/types/booking.types';
import { dateKey } from '@/utils/home';

// still in play for the passenger; completed and cancelled go under "Past"
const UPCOMING: BookingStatus[] = [
  BookingStatus.REQUESTED,
  BookingStatus.ACCEPTED,
  BookingStatus.REJECTED,
];

export function isUpcoming(booking: BookingListItem): boolean {
  return UPCOMING.includes(booking.status);
}

// how far back the "Past" lists go
export const PAST_WEEKS = 4;
const DAY_MS = 24 * 60 * 60 * 1000;

// the day of the ride; old bookings made before dates existed use the request day
function rideDay(booking: BookingListItem): string {
  return booking.travelDate ?? booking.requestedAt.slice(0, 10);
}

// "YYYY-MM-DD" strings sort like dates, so a plain >= works
export function isInPastWeeks(booking: BookingListItem, now: Date): boolean {
  const cutoff = dateKey(new Date(now.getTime() - PAST_WEEKS * 7 * DAY_MS));
  return rideDay(booking) >= cutoff;
}

export interface PastDrive {
  rideId: string;
  date: string;
  ride: BookingListItem['ride'];
  riders: BookingListItem[];
}

// driver side: one entry per ride per day, newest day first
export function groupDrivesByDay(items: BookingListItem[]): PastDrive[] {
  const drives: PastDrive[] = [];
  for (const item of items) {
    const date = rideDay(item);
    const drive = drives.find((d) => d.rideId === item.rideId && d.date === date);
    if (drive) {
      drive.riders.push(item);
    } else {
      drives.push({ rideId: item.rideId, date, ride: item.ride, riders: [item] });
    }
  }
  return drives.sort((a, b) => b.date.localeCompare(a.date));
}

export interface RideGroup {
  rideId: string;
  items: BookingListItem[];
}

// driver view: one section per ride, in the order the rides first appear
export function groupByRide(items: BookingListItem[]): RideGroup[] {
  const groups: RideGroup[] = [];
  for (const item of items) {
    let group = groups.find((g) => g.rideId === item.rideId);
    if (!group) {
      group = { rideId: item.rideId, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}
