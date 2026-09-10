import { apiClient } from './client';
import type { RideStatus } from '@/constants/ride-status.enum';
import type { Weekday } from '@/constants/weekday.enum';
import type { GeoPoint } from '@/types/user.types';
import type { Ride } from '@/types/ride.types';

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

export interface CreateRideInput {
  vehicleId: string;
  origin: GeoPoint;
  destination: GeoPoint;
  /** ISO 8601, must be in the future (backend `@IsDate` + `@MinDate`). */
  departureTime: string;
  daysOfWeek: Weekday[];
  seatsAvailable: number;
  costContribution: number;
}

export type UpdateRideInput = Partial<CreateRideInput> & {
  status?: RideStatus;
};

export async function getMyRides(): Promise<Ride[]> {
  const response = await apiClient.get<SuccessResponse<Ride[]>>('/rides/me');
  return response.data.data;
}

export async function createRide(input: CreateRideInput): Promise<Ride> {
  const response = await apiClient.post<SuccessResponse<Ride>>('/rides', input);
  return response.data.data;
}

export async function updateRide(
  id: string,
  input: UpdateRideInput,
): Promise<Ride> {
  const response = await apiClient.patch<SuccessResponse<Ride>>(
    `/rides/${id}`,
    input,
  );
  return response.data.data;
}
