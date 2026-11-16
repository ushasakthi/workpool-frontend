import { PreferredRole } from '@/constants/preferred-role.enum';
import { UserRole } from '@/constants/user-role.enum';
import { VerificationStatus } from '@/constants/verification-status.enum';
import { Weekday } from '@/constants/weekday.enum';

export interface VerificationInfo {
  identityStatus: VerificationStatus;
  workplaceStatus: VerificationStatus;
  reviewedAt?: string;
  rejectionReason?: string;
  submittedAt?: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  label?: string;
}

// Other users' coordinates are fuzzed by 300-500 m (approximate = true)
export interface TravelProfile {
  homeLocation?: GeoPoint;
  workLocation?: GeoPoint;
  workStartTime?: string;
  workEndTime?: string;
  daysAvailable: Weekday[];
  preferredRole?: PreferredRole;
  hideWorkplaceName?: boolean;
  approximate?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

// public part of the Trust Score (backend user-profile.serializer.ts)
export interface TrustSummary {
  // 0-100, null until calculated
  score: number | null;
  completedRides: number;
  ratingCount: number;
  averageRating: number;
  cancellationCount: number;
  // only reports an admin upheld, so a new report can't be traced back
  upheldComplaints: number;
}

// another user's profile, from GET /users/:id/profile
export interface PublicUserProfile {
  id: string;
  name: string;
  role: UserRole;
  photoUrl?: string;
  verification: VerificationInfo;
  trustScore: TrustSummary;
}

export interface EmergencyContact {
  name: string;
  // international format, e.g. +94771234567
  phone: string;
}

export interface UserProfile extends User {
  linkedinUrl?: string;
  photoUrl?: string;
  travelProfile?: TravelProfile;
  verification: VerificationInfo;
  // own profile only; who SOS alerts
  emergencyContact?: EmergencyContact;
}

export interface VerificationSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  nicNumber?: string;
  nicDocumentUrl?: string;
  linkedinUrl?: string;
  verification: VerificationInfo;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: User;
}
