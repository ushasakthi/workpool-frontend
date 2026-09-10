import { Platform } from 'react-native';

import { apiClient } from './client';
import type { PreferredRole } from '@/constants/preferred-role.enum';
import type { UserRole } from '@/constants/user-role.enum';
import type { Weekday } from '@/constants/weekday.enum';
import type { GeoPoint, UserProfile } from '@/types/user.types';

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

export async function getMe(): Promise<UserProfile> {
  const response = await apiClient.get<SuccessResponse<UserProfile>>('/users/me');
  return response.data.data;
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  const response = await apiClient.patch<SuccessResponse<UserProfile>>('/users/me/profile', input);
  return response.data.data;
}

export async function uploadProfilePhoto(file: ProfilePhotoFile): Promise<UserProfile> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // On web the picker gives a blob:/data: URI — turn it into a real Blob so the
    // multipart body carries an actual file part.
    const blob = await (await fetch(file.uri)).blob();
    formData.append('photo', blob, file.name);
  } else {
    // React Native's FormData takes a { uri, name, type } descriptor instead of a Blob.
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
  // React Native's FormData accepts a { uri, name, type } file descriptor here instead of
  // a real Blob — not representable in the DOM FormData types, hence the cast.
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
