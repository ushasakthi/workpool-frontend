import { apiClient } from './client';
import type { UserRole } from '@/constants/user-role.enum';
import type { AuthResult } from '@/types/user.types';

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

interface MessageResponse {
  message: string;
}

interface ResetPasswordResponse extends MessageResponse {
  email: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const response = await apiClient.post<SuccessResponse<AuthResult>>('/auth/register', input);
  return response.data.data;
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const response = await apiClient.post<SuccessResponse<AuthResult>>('/auth/login', input);
  return response.data.data;
}

export async function forgotPassword(email: string): Promise<string> {
  const response = await apiClient.post<SuccessResponse<MessageResponse>>('/auth/forgot-password', {
    email,
  });
  return response.data.data.message;
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<ResetPasswordResponse> {
  const response = await apiClient.post<SuccessResponse<ResetPasswordResponse>>('/auth/reset-password', {
    token,
    newPassword,
  });
  return response.data.data;
}
