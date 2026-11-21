import { Platform } from 'react-native';

import { apiClient } from './client';
import type { Vehicle } from '@/types/vehicle.types';

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

export interface CreateVehicleInput {
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  seatsAvailable: number;
}

export type UpdateVehicleInput = Partial<CreateVehicleInput> & {
  isActive?: boolean;
};

export interface VehiclePhotoFile {
  uri: string;
  name: string;
  mimeType: string;
}

export async function getMyVehicles(): Promise<Vehicle[]> {
  const response =
    await apiClient.get<SuccessResponse<Vehicle[]>>('/vehicles/me');
  return response.data.data;
}

export async function createVehicle(
  input: CreateVehicleInput,
): Promise<Vehicle> {
  const response = await apiClient.post<SuccessResponse<Vehicle>>(
    '/vehicles',
    input,
  );
  return response.data.data;
}

export async function updateVehicle(
  id: string,
  input: UpdateVehicleInput,
): Promise<Vehicle> {
  const response = await apiClient.patch<SuccessResponse<Vehicle>>(
    `/vehicles/${id}`,
    input,
  );
  return response.data.data;
}

export async function uploadVehiclePhoto(
  id: string,
  file: VehiclePhotoFile,
): Promise<Vehicle> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // web: turn the blob:/data: URI into a real Blob
    const blob = await (await fetch(file.uri)).blob();
    formData.append('photo', blob, file.name);
  } else {
    // native FormData takes { uri, name, type }
    formData.append('photo', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    } as unknown as Blob);
  }

  const response = await apiClient.patch<SuccessResponse<Vehicle>>(
    `/vehicles/${id}/photo`,
    formData,
  );
  return response.data.data;
}
