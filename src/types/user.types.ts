import { UserRole } from '@/constants/user-role.enum';
import { VerificationStatus } from '@/constants/verification-status.enum';

export interface VerificationInfo {
  identityStatus: VerificationStatus;
  workplaceStatus: VerificationStatus;
  reviewedAt?: string;
  rejectionReason?: string;
  submittedAt?: string;
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
