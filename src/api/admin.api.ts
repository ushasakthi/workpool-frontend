import { apiClient } from './client';
import type { VerificationStatus } from '@/constants/verification-status.enum';
import type { VerificationSubmission } from '@/types/user.types';

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

interface MessageResponse {
  message: string;
}

export interface AdminStats {
  activePassengers: number;
  activeRiders: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await apiClient.get<SuccessResponse<AdminStats>>('/admin/stats');
  return response.data.data;
}

export async function listVerifications(status?: VerificationStatus): Promise<VerificationSubmission[]> {
  const response = await apiClient.get<SuccessResponse<VerificationSubmission[]>>('/admin/verifications', {
    params: status ? { status } : undefined,
  });
  return response.data.data;
}

export async function getVerificationSubmission(userId: string): Promise<VerificationSubmission> {
  const response = await apiClient.get<SuccessResponse<VerificationSubmission>>(`/admin/verifications/${userId}`);
  return response.data.data;
}

export async function reviewVerification(
  userId: string,
  status: VerificationStatus.VERIFIED | VerificationStatus.REJECTED,
  rejectionReason?: string,
): Promise<string> {
  const response = await apiClient.patch<SuccessResponse<MessageResponse>>(`/admin/verifications/${userId}`, {
    status,
    rejectionReason,
  });
  return response.data.data.message;
}
