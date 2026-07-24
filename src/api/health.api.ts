import { apiClient } from './client';

export interface HealthStatus {
  status: 'ok';
  uptime: number;
  database: string;
}

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

export async function getHealth(): Promise<HealthStatus> {
  const response = await apiClient.get<SuccessResponse<HealthStatus>>('/health');
  return response.data.data;
}
