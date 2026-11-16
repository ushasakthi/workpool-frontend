import { apiClient } from './client';
import type { TodayRide, Trip, TripSummary } from '@/types/trip.types';

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

export async function getTodayRides(): Promise<TodayRide[]> {
  const response = await apiClient.get<SuccessResponse<TodayRide[]>>('/trips/today');
  return response.data.data;
}

// null when I'm not on a trip right now
export async function getCurrentTrip(): Promise<Trip | null> {
  const response = await apiClient.get<SuccessResponse<Trip | null>>('/trips/current');
  return response.data.data;
}

export async function startTrip(rideId: string): Promise<Trip> {
  const response = await apiClient.post<SuccessResponse<Trip>>('/trips', { rideId });
  return response.data.data;
}

export async function finishTrip(tripId: string): Promise<TripSummary> {
  const response = await apiClient.patch<SuccessResponse<TripSummary>>(`/trips/${tripId}/finish`);
  return response.data.data;
}
