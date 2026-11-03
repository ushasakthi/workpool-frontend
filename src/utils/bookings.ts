import { BookingStatus } from '@/constants/booking-status.enum';
import type { BookingListItem } from '@/types/booking.types';

// still in play for the passenger; completed and cancelled go under "Past"
const UPCOMING: BookingStatus[] = [
  BookingStatus.REQUESTED,
  BookingStatus.ACCEPTED,
  BookingStatus.REJECTED,
];

export function isUpcoming(booking: BookingListItem): boolean {
  return UPCOMING.includes(booking.status);
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
