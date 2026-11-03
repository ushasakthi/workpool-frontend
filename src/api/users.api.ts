import { Platform } from 'react-native';

import { apiClient } from './client';
import type { PreferredRole } from '@/constants/preferred-role.enum';
import type { UserRole } from '@/constants/user-role.enum';
import type { Weekday } from '@/constants/weekday.enum';
import type {
  EmergencyContact,
  GeoPoint,
  PublicUserProfile,
  UserProfile,
} from '@/types/user.types';

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

interface MessageResponse {
  message: string;
}

export interface NicDocumentFile {
  uri: string;
  name: string;
  mimeType: string;
}

export interface SubmitVerificationInput {
  nicNumber: string;
  linkedinUrl: string;
  file: NicDocumentFile;
  onUploadProgress?: (percent: number) => void;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  role?: UserRole;
}

export interface ProfilePhotoFile {
  uri: string;
  name: string;
  mimeType: string;
}

export interface UpdateTravelProfileInput {
  homeLocation?: GeoPoint;
  workLocation?: GeoPoint;
  workStartTime?: string;
  workEndTime?: string;
  daysAvailable?: Weekday[];
  preferredRole?: PreferredRole;
  hideWorkplaceName?: boolean;
}

export async function getUserProfile(userId: string): Promise<PublicUserProfile> {
  const response = await apiClient.get<SuccessResponse<PublicUserProfile>>(
    `/users/${userId}/profile`,
  );
  return response.data.data;
}

export async function getMe(): Promise<UserProfile> {
  const response = await apiClient.get<SuccessResponse<UserProfile>>('/users/me');
  return response.data.data;
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  const response = await apiClient.patch<SuccessResponse<UserProfile>>('/users/me/profile', input);
  return response.data.data;
}

export async function updateEmergencyContact(input: EmergencyContact): Promise<UserProfile> {
  const response = await apiClient.patch<SuccessResponse<UserProfile>>(
    '/users/me/emergency-contact',
    input,
  );
  return response.data.data;
}

export async function uploadProfilePhoto(file: ProfilePhotoFile): Promise<UserProfile> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // web: turn the blob:/data: URI into a real Blob
    const blob = await (await fetch(file.uri)).blob();
    formData.append('photo', blob, file.name);
  } else {
    // native FormData takes { uri, name, type }
    formData.append(
      'photo',
      { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob,
    );
  }

  const response = await apiClient.patch<SuccessResponse<UserProfile>>(
    '/users/me/photo',
    formData,
  );
  return response.data.data;
}

export async function updateTravelProfile(
  input: UpdateTravelProfileInput,
): Promise<UserProfile> {
  const response = await apiClient.patch<SuccessResponse<UserProfile>>(
    '/users/me/travel-profile',
    input,
  );
  return response.data.data;
}

export async function submitVerification(input: SubmitVerificationInput): Promise<string> {
  const formData = new FormData();
  formData.append('nicNumber', input.nicNumber);
  formData.append('linkedinUrl', input.linkedinUrl);
  // RN FormData accepts { uri, name, type } but the TS types don't, so cast
  formData.append(
    'nicDocument',
    { uri: input.file.uri, name: input.file.name, type: input.file.mimeType } as unknown as Blob,
  );

  const response = await apiClient.patch<SuccessResponse<MessageResponse>>(
    '/users/me/verification',
    formData,
    {
      onUploadProgress: (event) => {
        if (!input.onUploadProgress || !event.total) return;
        input.onUploadProgress(Math.round((event.loaded / event.total) * 100));
      },
    },
  );
  return response.data.data.message;
}
