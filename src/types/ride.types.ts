import { RideStatus } from '@/constants/ride-status.enum';
import { Weekday } from '@/constants/weekday.enum';
import type { GeoPoint } from '@/types/user.types';

// Mirrors the backend RideView (workpool-backend
// src/modules/rides/serializers/ride.serializer.ts).
export interface Ride {
  id: string;
  driverId: string;
  vehicleId: string;
  origin: GeoPoint;
  destination: GeoPoint;
  // ISO 8601 — the next/first departure instant. `daysOfWeek` carries the recurrence.
  departureTime: string;
  daysOfWeek: Weekday[];
  seatsAvailable: number;
  // A suggested cost-sharing contribution toward fuel — never a fare or price.
  costContribution: number;
  status: RideStatus;
}
