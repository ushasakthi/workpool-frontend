import type { Icons } from '@/constants/icons';
import { VerificationStatus } from '@/constants/verification-status.enum';

interface VerificationStatusDisplay {
  label: string;
  tone: 'primary' | 'neutral' | 'danger';
  icon: keyof typeof Icons;
}

// each status has its own icon and label, not just a colour (accessibility)
const STATUS_DISPLAY: Record<VerificationStatus, VerificationStatusDisplay> = {
  [VerificationStatus.VERIFIED]: { label: 'Verified', tone: 'primary', icon: 'checkCircle' },
  [VerificationStatus.PENDING]: { label: 'Pending review', tone: 'neutral', icon: 'clock' },
  [VerificationStatus.REJECTED]: { label: 'Action needed', tone: 'danger', icon: 'warningTriangle' },
};

export function getVerificationStatusDisplay(
  status: VerificationStatus,
): VerificationStatusDisplay {
  return STATUS_DISPLAY[status];
}

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
