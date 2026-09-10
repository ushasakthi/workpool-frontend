import { create } from 'zustand';

import {
  createVehicle,
  getMyVehicles,
  updateVehicle,
  uploadVehiclePhoto,
  type CreateVehicleInput,
  type UpdateVehicleInput,
  type VehiclePhotoFile,
} from '@/api/vehicles.api';
import type { Vehicle } from '@/types/vehicle.types';

interface VehicleState {
  /** null until the first load resolves. */
  vehicles: Vehicle[] | null;
  load: () => Promise<void>;
  addVehicle: (
    input: CreateVehicleInput,
    photo?: VehiclePhotoFile | null,
  ) => Promise<void>;
  saveVehicle: (
    id: string,
    input: UpdateVehicleInput,
    photo?: VehiclePhotoFile | null,
  ) => Promise<void>;
  setActive: (id: string, isActive: boolean) => Promise<void>;
}

// Thin store: state + actions only. Network lives in api/vehicles.api.ts; actions
// throw on failure and the screen decides how to surface it (same as useAuthStore).
export const useVehicleStore = create<VehicleState>((set) => ({
  vehicles: null,

  load: async () => {
    set({ vehicles: await getMyVehicles() });
  },

  addVehicle: async (input, photo) => {
    let vehicle = await createVehicle(input);
    if (photo) {
      vehicle = await uploadVehiclePhoto(vehicle.id, photo);
    }
    set((state) => ({ vehicles: [vehicle, ...(state.vehicles ?? [])] }));
  },

  saveVehicle: async (id, input, photo) => {
    let vehicle = await updateVehicle(id, input);
    if (photo) {
      vehicle = await uploadVehiclePhoto(id, photo);
    }
    set((state) => ({ vehicles: replaceById(state.vehicles, vehicle) }));
  },

  setActive: async (id, isActive) => {
    const vehicle = await updateVehicle(id, { isActive });
    set((state) => ({ vehicles: replaceById(state.vehicles, vehicle) }));
  },
}));

function replaceById(list: Vehicle[] | null, updated: Vehicle): Vehicle[] {
  if (!list) return [updated];
  return list.map((vehicle) => (vehicle.id === updated.id ? updated : vehicle));
}
