// Mirrors the backend VehicleView (workpool-backend
// src/modules/vehicles/serializers/vehicle.serializer.ts) field-for-field.
export interface Vehicle {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  seatsAvailable: number;
  // Soft on/off switch — an inactive vehicle stays on file but can't be used to
  // post new rides.
  isActive: boolean;
  // Auth-gated fetch route (`/vehicles/:id/photo?v=…`), not a raw filename.
  photoUrl?: string;
}
