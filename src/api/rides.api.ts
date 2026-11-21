import { apiClient } from './client';
import type { RideStatus } from '@/constants/ride-status.enum';
import type { Weekday } from '@/constants/weekday.enum';
import type { GeoPoint } from '@/types/user.types';
import type { Ride, RideMatch, RideSearchPage } from '@/types/ride.types';

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

export interface CreateRideInput {
  vehicleId: string;
  origin: GeoPoint;
  destination: GeoPoint;
  // up to 3, in driving order
  via: GeoPoint[];
  // ISO date, must be in the future
  departureTime: string;
  daysOfWeek: Weekday[];
  seatsAvailable: number;
  costContribution: number;
}

export type UpdateRideInput = Partial<CreateRideInput> & {
  status?: RideStatus;
};

// same fields as backend SearchRidesQueryDto
export interface SearchRidesQuery {
  maxDistanceKm: number;
  // "HH:mm", Colombo time
  departAfter?: string;
  departBefore?: string;
  page?: number;
  limit?: number;
}

export async function searchRides(query: SearchRidesQuery): Promise<RideSearchPage> {
  const response = await apiClient.get<SuccessResponse<RideSearchPage>>('/rides/search', {
    params: query,
  });
  return response.data.data;
}

export async function getRide(id: string): Promise<RideMatch> {
  const response = await apiClient.get<SuccessResponse<RideMatch>>(`/rides/${id}`);
  return response.data.data;
}

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
