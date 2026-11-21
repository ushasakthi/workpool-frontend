import type { TravelProfile } from '@/types/user.types';

// what matching needs: home, work, hours and days
export const TRAVEL_STEPS = 4;

export function travelStepsDone(profile?: TravelProfile): number {
  if (!profile) return 0;
  return [
    profile.homeLocation,
    profile.workLocation,
    profile.workStartTime && profile.workEndTime,
    profile.daysAvailable.length > 0,
  ].filter(Boolean).length;
}
