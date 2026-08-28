import { VerificationStatus } from '@/constants/verification-status.enum';

export function getOverallVerificationStatus(
  identityStatus: VerificationStatus,
  workplaceStatus: VerificationStatus,
): VerificationStatus {
  if (identityStatus === VerificationStatus.REJECTED || workplaceStatus === VerificationStatus.REJECTED) {
    return VerificationStatus.REJECTED;
  }
  if (identityStatus === VerificationStatus.VERIFIED && workplaceStatus === VerificationStatus.VERIFIED) {
    return VerificationStatus.VERIFIED;
  }
  return VerificationStatus.PENDING;
}
