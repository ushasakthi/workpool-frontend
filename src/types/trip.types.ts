import type { TripStatus } from '@/constants/trip-status.enum';
import type { GeoPoint } from '@/types/user.types';

// Same shapes as backend trips/serializers/trip.serializer.ts

// GET /trips/today: one of the driver's rides that runs today
export interface TodayRide {
  rideId: string;
  origin: GeoPoint;
  destination: GeoPoint;
  departureTime: string;
  riders: number;
  // 30 min before departure
  canStartAt: string;
  tripId: string | null;
  tripStatus: TripStatus | null;
}

export interface TripStop {
  bookingId: string;
  passenger: { id: string; name: string; trustScore: number | null };
  seats: number;
  pickupLabel: string;
  pickedUpAt?: string;
  droppedOffAt?: string;
}

interface TripBase {
  id: string;
  rideId: string;
  date: string;
  startedAt: string;
  origin: GeoPoint;
  destination: GeoPoint;
  departureTime: string;
}

export interface DriverTrip extends TripBase {
  side: 'driver';
  // in pickup order
  stops: TripStop[];
}

export interface PassengerTrip extends TripBase {
  side: 'passenger';
  driver: { id: string; name: string; trustScore: number | null };
  vehicle: { make: string; model: string; plateNumber: string } | null;
  booking: {
    id: string;
    seats: number;
    // per seat
    costContribution: number;
    pickupPin?: string;
    pickedUpAt?: string;
  };
  pickupLabel: string;
  stopNumber: number;
  stopCount: number;
}

// "side" tells the two apart, so TypeScript knows which fields exist
export type Trip = DriverTrip | PassengerTrip;

// app only: one row of the passenger's trip timeline
export interface TimelineStep {
  label: string;
  // small grey line under the label, e.g. "You're stop 2 of 3"
  note?: string;
  // shown on the right for done steps, e.g. "7:45"
  time?: string;
  state: 'done' | 'current' | 'todo';
}

// PATCH /trips/:id/finish
export interface TripSummary {
  id: string;
  origin: GeoPoint;
  destination: GeoPoint;
  startedAt: string;
  finishedAt: string;
  riders: number;
  costsShared: number;
  co2SavedKg: number;
  completedBookingIds: string[];
}
