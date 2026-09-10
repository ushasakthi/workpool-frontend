import { create } from 'zustand';

import {
  createRide,
  getMyRides,
  updateRide,
  type CreateRideInput,
  type UpdateRideInput,
} from '@/api/rides.api';
import type { RideStatus } from '@/constants/ride-status.enum';
import type { Ride } from '@/types/ride.types';

interface RideState {
  /** null until the first load resolves. */
  rides: Ride[] | null;
  load: () => Promise<void>;
  postRide: (input: CreateRideInput) => Promise<void>;
  saveRide: (id: string, input: UpdateRideInput) => Promise<void>;
  setStatus: (id: string, status: RideStatus) => Promise<void>;
}

// Thin store: state + actions only. Network lives in api/rides.api.ts; actions
// throw on failure and the screen surfaces it (same as useVehicleStore).
export const useRideStore = create<RideState>((set) => ({
  rides: null,

  load: async () => {
    set({ rides: await getMyRides() });
  },

  postRide: async (input) => {
    const ride = await createRide(input);
    set((state) => ({ rides: [ride, ...(state.rides ?? [])] }));
  },

  saveRide: async (id, input) => {
    const ride = await updateRide(id, input);
    set((state) => ({ rides: replaceById(state.rides, ride) }));
  },

  setStatus: async (id, status) => {
    const ride = await updateRide(id, { status });
    set((state) => ({ rides: replaceById(state.rides, ride) }));
  },
}));

function replaceById(list: Ride[] | null, updated: Ride): Ride[] {
  if (!list) return [updated];
  return list.map((ride) => (ride.id === updated.id ? updated : ride));
}
