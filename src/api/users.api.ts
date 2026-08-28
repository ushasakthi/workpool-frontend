import { apiClient } from './client';
import type { UserProfile } from '@/types/user.types';

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

export async function getMe(): Promise<UserProfile> {
  const response = await apiClient.get<SuccessResponse<UserProfile>>('/users/me');
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
