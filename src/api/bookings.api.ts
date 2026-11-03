import { apiClient } from './client';
import type { BookingStatus } from '@/constants/booking-status.enum';
import type { Booking, BookingListItem, Savings } from '@/types/booking.types';

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

export interface CreateBookingInput {
  rideId: string;
  seatsRequested: number;
}

// "passenger" = bookings I made, "driver" = requests on rides I drive
export type BookingSide = 'passenger' | 'driver';

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const response = await apiClient.post<SuccessResponse<Booking>>('/bookings', input);
  return response.data.data;
}

export async function getMyBookings(
  side: BookingSide,
  status?: BookingStatus,
): Promise<BookingListItem[]> {
  const response = await apiClient.get<SuccessResponse<BookingListItem[]>>('/bookings/me', {
    params: { as: side, status },
  });
  return response.data.data;
}

// month = "YYYY-MM" (Colombo calendar), defaults to this month
export async function getSavings(month?: string): Promise<Savings> {
  const response = await apiClient.get<SuccessResponse<Savings>>('/bookings/me/savings', {
    params: month ? { month } : undefined,
  });
  return response.data.data;
}

export async function acceptBooking(id: string): Promise<Booking> {
  const response = await apiClient.patch<SuccessResponse<Booking>>(`/bookings/${id}/accept`);
  return response.data.data;
}

export async function rejectBooking(id: string): Promise<Booking> {
  const response = await apiClient.patch<SuccessResponse<Booking>>(`/bookings/${id}/reject`);
  return response.data.data;
}

export async function completeBooking(id: string): Promise<Booking> {
  const response = await apiClient.patch<SuccessResponse<Booking>>(`/bookings/${id}/complete`);
  return response.data.data;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const response = await apiClient.patch<SuccessResponse<Booking>>(`/bookings/${id}/cancel`);
  return response.data.data;
}
