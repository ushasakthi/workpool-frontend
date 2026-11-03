import { apiClient } from './client';
import type { ReportCategory } from '@/constants/report-category.enum';
import type { ReportStatus } from '@/constants/report-status.enum';

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

export interface CreateReportInput {
  bookingId: string;
  category: ReportCategory;
  reason?: string;
}

// the reporter only gets an acknowledgement back, reports are admin-only
export async function createReport(
  input: CreateReportInput,
): Promise<{ id: string; status: ReportStatus }> {
  const response = await apiClient.post<SuccessResponse<{ id: string; status: ReportStatus }>>(
    '/reports',
    input,
  );
  return response.data.data;
}
