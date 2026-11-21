// Same shape as backend vehicle.serializer.ts
export interface Vehicle {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  seatsAvailable: number;
  // inactive vehicles can't be used for new rides
  isActive: boolean;
  // auth-protected URL, not a filename
  photoUrl?: string;
}
