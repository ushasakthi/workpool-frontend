import { create } from 'zustand';

import { finishTrip, getCurrentTrip, getTodayRides, startTrip } from '@/api/trips.api';
import type { TodayRide, Trip, TripSummary } from '@/types/trip.types';

interface TripState {
  // the trip I'm on now; null = none (or not checked yet, see `checked`)
  current: Trip | null;
  // true once the server has answered at least once
  checked: boolean;
  // when `current` last loaded, for "Last updated 7:54" when offline
  updatedAt: Date | null;
  loadCurrent: () => Promise<void>;

  // driver: my rides that run today; null = not loaded
  today: TodayRide[] | null;
  loadToday: () => Promise<void>;

  start: (rideId: string) => Promise<void>;
  finish: (tripId: string) => Promise<TripSummary>;
}

export const useTripStore = create<TripState>((set) => ({
  current: null,
  checked: false,
  updatedAt: null,

  loadCurrent: async () => {
    const trip = await getCurrentTrip();
    set({ current: trip, checked: true, updatedAt: new Date() });
  },

  today: null,

  loadToday: async () => {
    set({ today: await getTodayRides() });
  },

  start: async (rideId) => {
    const trip = await startTrip(rideId);
    set({ current: trip, checked: true, updatedAt: new Date() });
  },

  finish: async (tripId) => {
    const summary = await finishTrip(tripId);
    set({ current: null });
    return summary;
  },
}));
