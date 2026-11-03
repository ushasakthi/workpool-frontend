import { AdminAction } from '@/constants/admin-action.enum';
import { UserRole } from '@/constants/user-role.enum';
import { VerificationStatus } from '@/constants/verification-status.enum';

// Same shapes as backend admin.service.ts (admin screens only)
export interface AdminStats {
  totalUsers: number;
  activePassengers: number;
  activeRiders: number;
  activeRides: number;
  completedRides: number;
  openReports: number;
  pendingVerifications: number;
  newUsersThisWeek: number;
  completedRidesThisMonth: number;
  openSafetyReports: number;
  // null when that queue is empty
  oldestPendingVerificationAt: string | null;
  oldestOpenReportAt: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verification: {
    identityStatus: VerificationStatus;
    workplaceStatus: VerificationStatus;
    submitted: boolean;
  };
  trustScore: number | null;
  suspended: boolean;
  suspendedAt?: string;
  suspensionReason?: string;
  createdAt: string;
}

export interface AdminUsersPage {
  items: AdminUser[];
  page: number;
  limit: number;
  // matching the filters
  total: number;
  // across everyone
  counts: { all: number; suspended: number };
}

export interface ActionLogEntry {
  id: string;
  action: AdminAction;
  createdAt: string;
  note?: string;
  reportId?: string;
  admin: { id: string; name: string };
  targetUser?: { id: string; name: string };
}
