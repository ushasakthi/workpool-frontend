import { create } from 'zustand';

import { createReview, getUserReviews, type CreateReviewInput } from '@/api/reviews.api';
import { getUserProfile } from '@/api/users.api';
import type { Review } from '@/types/review.types';
import type { PublicUserProfile } from '@/types/user.types';

interface ReviewState {
  // another user's public profile + their reviews, null = loading
  profile: PublicUserProfile | null;
  reviews: Review[] | null;
  loadProfile: (userId: string) => Promise<void>;
  submitReview: (input: CreateReviewInput) => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set) => ({
  profile: null,
  reviews: null,

  loadProfile: async (userId) => {
    set({ profile: null, reviews: null });
    const [profile, reviews] = await Promise.all([
      getUserProfile(userId),
      getUserReviews(userId),
    ]);
    set({ profile, reviews });
  },

  submitReview: async (input) => {
    await createReview(input);
  },
}));
