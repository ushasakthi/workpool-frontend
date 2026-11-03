import { create } from 'zustand';

import {
  createRide,
  getMyRides,
  getRide,
  searchRides,
  updateRide,
  type CreateRideInput,
  type SearchRidesQuery,
  type UpdateRideInput,
} from '@/api/rides.api';
import type { RideStatus } from '@/constants/ride-status.enum';
import type { Ride, RideMatch, RideSearchPage } from '@/types/ride.types';
import { shiftHhMm } from '@/utils/time';

// what the passenger picks on the search screen
export interface SearchFilters {
  // "HH:mm"
  leaveAround: string;
  flexMinutes: number;
  maxWalkKm: number;
}

const DEFAULT_FILTERS: SearchFilters = {
  leaveAround: '08:00',
  flexMinutes: 30,
  maxWalkKm: 1,
};

const RESULTS_PER_PAGE = 20;

interface RideState {
  // null = not loaded yet
  rides: Ride[] | null;
  load: () => Promise<void>;
  postRide: (input: CreateRideInput) => Promise<void>;
  saveRide: (id: string, input: UpdateRideInput) => Promise<void>;
  setStatus: (id: string, status: RideStatus) => Promise<void>;

  searchFilters: SearchFilters;
  // null = searching
  searchResults: RideSearchPage | null;
  setSearchFilters: (filters: SearchFilters) => void;
  search: () => Promise<void>;
  // fetches the next page and adds it to the end of searchResults
  loadMoreResults: () => Promise<void>;

  // null = loading
  rideDetail: RideMatch | null;
  loadRide: (id: string) => Promise<void>;
}

export const useRideStore = create<RideState>((set, get) => ({
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

  searchFilters: DEFAULT_FILTERS,
  searchResults: null,

  setSearchFilters: (filters) => {
    set({ searchFilters: filters });
  },

  search: async () => {
    set({ searchResults: null });
    const results = await searchRides(toSearchQuery(get().searchFilters, 1));
    set({ searchResults: results });
  },

  loadMoreResults: async () => {
    const current = get().searchResults;
    if (!current) return;
    const next = await searchRides(toSearchQuery(get().searchFilters, current.page + 1));
    set({ searchResults: { ...next, items: [...current.items, ...next.items] } });
  },

  rideDetail: null,

  loadRide: async (id) => {
    set({ rideDetail: null });
    set({ rideDetail: await getRide(id) });
  },
}));

// "8:00 ±30 min within 1 km" -> the backend's query params
function toSearchQuery(filters: SearchFilters, page: number): SearchRidesQuery {
  return {
    maxDistanceKm: filters.maxWalkKm,
    departAfter: shiftHhMm(filters.leaveAround, -filters.flexMinutes),
    departBefore: shiftHhMm(filters.leaveAround, filters.flexMinutes),
    page,
    limit: RESULTS_PER_PAGE,
  };
}

function replaceById(list: Ride[] | null, updated: Ride): Ride[] {
  if (!list) return [updated];
  return list.map((ride) => (ride.id === updated.id ? updated : ride));
}
