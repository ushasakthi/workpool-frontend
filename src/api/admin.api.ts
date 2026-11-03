import { apiClient } from './client';
import type { ReportStatus } from '@/constants/report-status.enum';
import type { VerificationStatus } from '@/constants/verification-status.enum';
import type { UserRole } from '@/constants/user-role.enum';
import type { ActionLogEntry, AdminStats, AdminUser, AdminUsersPage } from '@/types/admin.types';
import type { AdminReport } from '@/types/report.types';
import type { VerificationSubmission } from '@/types/user.types';

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

interface MessageResponse {
  message: string;
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

export async function listReports(status?: ReportStatus): Promise<AdminReport[]> {
  const response = await apiClient.get<SuccessResponse<AdminReport[]>>('/admin/reports', {
    params: status ? { status } : undefined,
  });
  return response.data.data;
}

// "reviewed" = upheld (still counts against Trust Score), "dismissed" = unfounded
export async function resolveReport(
  id: string,
  status: ReportStatus.REVIEWED | ReportStatus.DISMISSED,
): Promise<void> {
  await apiClient.patch(`/admin/reports/${id}`, { status });
}

// same fields as backend ListUsersQueryDto
export interface ListUsersQuery {
  q?: string;
  role?: UserRole;
  status?: 'active' | 'suspended';
  verification?: 'verified' | 'pending';
  page?: number;
  limit?: number;
}

export async function listUsers(query: ListUsersQuery): Promise<AdminUsersPage> {
  const response = await apiClient.get<SuccessResponse<AdminUsersPage>>('/admin/users', {
    params: query,
  });
  return response.data.data;
}

// reason is required by the backend when suspending
export async function setUserSuspended(
  id: string,
  suspended: boolean,
  reason?: string,
): Promise<AdminUser> {
  const response = await apiClient.patch<SuccessResponse<AdminUser>>(`/admin/users/${id}/suspend`, {
    suspended,
    reason,
  });
  return response.data.data;
}

export async function listActionLog(limit = 100): Promise<ActionLogEntry[]> {
  const response = await apiClient.get<SuccessResponse<ActionLogEntry[]>>('/admin/action-log', {
    params: { limit },
  });
  return response.data.data;
}
