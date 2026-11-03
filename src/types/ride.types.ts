import { RideStatus } from '@/constants/ride-status.enum';
import { VerificationStatus } from '@/constants/verification-status.enum';
import { Weekday } from '@/constants/weekday.enum';
import type { GeoPoint } from '@/types/user.types';

// Same shape as backend ride.serializer.ts
export interface Ride {
  id: string;
  driverId: string;
  vehicleId: string;
  origin: GeoPoint;
  destination: GeoPoint;
  // ISO date of the next departure
  departureTime: string;
  daysOfWeek: Weekday[];
  seatsAvailable: number;
  // shared fuel cost, not a fare
  costContribution: number;
  status: RideStatus;
}

// Smart Matching Score, each value is 0-1 (see backend docs/sms-formula.md)
export interface SmsBreakdown {
  route: number;
  time: number;
  workplace: number;
  availability: number;
}

export interface SmsResult {
  score: number;
  breakdown: SmsBreakdown;
}

export interface RideDriver {
  id: string;
  name: string;
  photoUrl?: string;
  verification: {
    identityStatus: VerificationStatus;
    workplaceStatus: VerificationStatus;
  };
  // null until Trust Score is built (Sprint 6)
  trustScore: number | null;
}

// a ride as a passenger sees it, from GET /rides/search and GET /rides/:id
export interface RideMatch extends Ride {
  match: SmsResult;
  // null when the passenger has no home location
  pickupDistanceKm: number | null;
  driver: RideDriver;
}

export interface RideSearchPage {
  items: RideMatch[];
  page: number;
  limit: number;
  total: number;
}
