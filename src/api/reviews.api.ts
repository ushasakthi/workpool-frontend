import { apiClient } from './client';
import type { Review } from '@/types/review.types';

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

export interface CreateReviewInput {
  bookingId: string;
  // 1-5
  rating: number;
  comment?: string;
}

export async function createReview(input: CreateReviewInput): Promise<{ id: string }> {
  const response = await apiClient.post<SuccessResponse<{ id: string }>>('/reviews', input);
  return response.data.data;
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  const response = await apiClient.get<SuccessResponse<Review[]>>(`/users/${userId}/reviews`);
  return response.data.data;
}
