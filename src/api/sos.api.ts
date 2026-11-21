import { apiClient } from './client';
import type { EmergencyContact } from '@/types/user.types';

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

// Same shape as backend sos.service.ts SosResult
export interface SosResult {
  alertId: string;
  contact: EmergencyContact;
  // ready to put into the Messages app
  message: string;
}

// records the alert on the server (FR17); the phone then sends the message itself
export async function triggerSos(bookingId: string): Promise<SosResult> {
  const response = await apiClient.post<SuccessResponse<SosResult>>('/sos', { bookingId });
  return response.data.data;
}
