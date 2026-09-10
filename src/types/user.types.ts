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

// Mirrors the backend TravelProfile. For the owner's own view the coordinates are
// exact and `approximate` is false; for other users they're fuzzed 300-500 m.
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

export interface UserProfile extends User {
  linkedinUrl?: string;
  photoUrl?: string;
  travelProfile?: TravelProfile;
  verification: VerificationInfo;
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
