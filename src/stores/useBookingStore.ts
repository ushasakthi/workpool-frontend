import { create } from 'zustand';

import {
  acceptBooking,
  cancelBooking,
  completeBooking,
  createBooking,
  getMyBookings,
  getSavings,
  rejectBooking,
  verifyPickup,
  type CreateBookingInput,
} from '@/api/bookings.api';
import { createReport, type CreateReportInput } from '@/api/reports.api';
import { BookingStatus } from '@/constants/booking-status.enum';
import type { Booking, BookingListItem, Savings } from '@/types/booking.types';

// null = not loaded yet
type BookingList = BookingListItem[] | null;

// what the driver still has to act on: answer it, or mark it completed
const DRIVER_OPEN: BookingStatus[] = [BookingStatus.REQUESTED, BookingStatus.ACCEPTED];

interface BookingState {
  // passenger side
  myBookings: BookingList;
  loadMyBookings: () => Promise<void>;
  requestRide: (input: CreateBookingInput) => Promise<Booking>;
  cancel: (id: string) => Promise<void>;

  // driver side: pending requests + accepted riders on my rides
  requests: BookingList;
  loadRequests: () => Promise<void>;
  accept: (id: string) => Promise<void>;
  decline: (id: string) => Promise<void>;
  verifyPickup: (id: string, pin: string) => Promise<void>;
  complete: (id: string) => Promise<void>;

  // one month of estimated savings; null = loading
  savings: Savings | null;
  loadSavings: (month?: string) => Promise<void>;

  // either side
  markReviewed: (bookingId: string) => void;
  reportIssue: (input: CreateReportInput) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  myBookings: null,

  loadMyBookings: async () => {
    set({ myBookings: await getMyBookings('passenger') });
  },

  requestRide: async (input) => {
    const booking = await createBooking(input);
    // the list needs the ride + driver, so reload it next time it's opened
    set({ myBookings: null });
    return booking;
  },

  cancel: async (id) => {
    const booking = await cancelBooking(id);
    set((state) => ({ myBookings: setStatus(state.myBookings, booking) }));
  },

  requests: null,

  loadRequests: async () => {
    const all = await getMyBookings('driver');
    set({ requests: all.filter((item) => DRIVER_OPEN.includes(item.status)) });
  },

  // answered requests stay on screen with their result until the next reload
  accept: async (id) => {
    const booking = await acceptBooking(id);
    set((state) => ({
      requests: changeSeats(setStatus(state.requests, booking), booking.rideId, -booking.seatsRequested),
    }));
  },

  decline: async (id) => {
    const booking = await rejectBooking(id);
    set((state) => ({ requests: setStatus(state.requests, booking) }));
  },

  verifyPickup: async (id, pin) => {
    const booking = await verifyPickup(id, pin);
    set((state) => ({ requests: setStatus(state.requests, booking) }));
  },

  // completing frees the seat again (rides repeat weekly)
  complete: async (id) => {
    const booking = await completeBooking(id);
    set((state) => ({
      requests: changeSeats(setStatus(state.requests, booking), booking.rideId, booking.seatsRequested),
    }));
  },

  savings: null,

  loadSavings: async (month) => {
    set({ savings: null });
    set({ savings: await getSavings(month) });
  },

  markReviewed: (bookingId) => {
    const mark = (list: BookingList): BookingList =>
      list?.map((item) => (item.id === bookingId ? { ...item, reviewedByMe: true } : item)) ??
      null;
    set((state) => ({ myBookings: mark(state.myBookings), requests: mark(state.requests) }));
  },

  reportIssue: async (input) => {
    await createReport(input);
  },
}));

// copies the new status (and pickup time) onto the card already in the list
function setStatus(list: BookingList, updated: Booking): BookingList {
  if (!list) return null;
  return list.map((item) =>
    item.id === updated.id
      ? { ...item, status: updated.status, pickupVerifiedAt: updated.pickupVerifiedAt }
      : item,
  );
}

// accepting takes seats, completing gives them back, so other cards on that ride stay correct
function changeSeats(list: BookingList, rideId: string, delta: number): BookingList {
  if (!list) return null;
  return list.map((item) =>
    item.rideId === rideId
      ? { ...item, ride: { ...item.ride, seatsAvailable: item.ride.seatsAvailable + delta } }
      : item,
  );
}
