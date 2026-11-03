import { BookingStatus } from '@/constants/booking-status.enum';
import { RideStatus } from '@/constants/ride-status.enum';
import { Weekday } from '@/constants/weekday.enum';
import type { GeoPoint } from '@/types/user.types';

// Same shape as backend booking.serializer.ts
export interface Booking {
  id: string;
  rideId: string;
  passengerId: string;
  status: BookingStatus;
  seatsRequested: number;
  requestedAt: string;
  respondedAt?: string;
}

// from GET /bookings/me, with the ride and the other person
export interface BookingListItem extends Booking {
  ride: {
    origin: GeoPoint;
    destination: GeoPoint;
    departureTime: string;
    daysOfWeek: Weekday[];
    seatsAvailable: number;
    // shared fuel cost, not a fare
    costContribution: number;
    status: RideStatus;
  };
  // true once I've rated the other person on this (completed) booking
  reviewedByMe: boolean;
  // the driver when I'm the passenger, the passenger when I'm the driver
  otherParty: {
    id: string;
    name: string;
    photoUrl?: string;
    // null until Trust Score is built (Sprint 6)
    trustScore: number | null;
  };
}

// Same shape as backend bookings.service.ts SavingsView, all amounts in LKR (estimates)
export interface Savings {
  // "2026-10"
  month: string;
  isCurrentMonth: boolean;
  asPassenger: {
    rides: number;
    soloCost: number;
    contributions: number;
    saved: number;
    avgContribution: number;
    co2SavedKg: number;
  };
  asDriver: {
    rides: number;
    tripCost: number;
    // contributions, each capped at that trip's cost
    costsShared: number;
    yourShare: number;
    avgShared: number;
    co2SavedKg: number;
  };
}
