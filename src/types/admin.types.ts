import { AdminAction } from '@/constants/admin-action.enum';
import { BookingStatus } from '@/constants/booking-status.enum';
import { ReportCategory } from '@/constants/report-category.enum';
import { ReportSeverity } from '@/constants/report-severity.enum';
import { ReportStatus } from '@/constants/report-status.enum';
import { UserRole } from '@/constants/user-role.enum';
import { VerificationStatus } from '@/constants/verification-status.enum';
import type { Ride } from '@/types/ride.types';
import type { EmergencyContact, GeoPoint, TravelProfile } from '@/types/user.types';
import type { Vehicle } from '@/types/vehicle.types';

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

// a ride the user joined as a passenger
export interface AdminJoinedRide {
  bookingId: string;
  status: BookingStatus;
  seatsRequested: number;
  requestedAt: string;
  // the day of this seat, "2026-11-18"
  travelDate?: string;
  // null if the ride was deleted
  ride: {
    origin: GeoPoint;
    destination: GeoPoint;
    departureTime: string;
    // shared fuel cost, not a fare
    costContribution: number;
  } | null;
}

export interface AdminUserDetail extends AdminUser {
  phone: string;
  linkedinUrl?: string;
  travelProfile?: TravelProfile;
  emergencyContact?: EmergencyContact;
  vehicles: Vehicle[];
  // as the driver, newest first
  ridesOffered: Ride[];
  // as a passenger, newest first
  ridesJoined: AdminJoinedRide[];
  // reports filed against this user, open and decided, newest first
  reportsAgainst: AdminUserReport[];
}

// Same shape as backend admin.service.ts AdminUserReportView
export interface AdminUserReport {
  id: string;
  category: ReportCategory;
  reason?: string;
  status: ReportStatus;
  // set when an admin upholds the report
  severity?: ReportSeverity;
  reportedByName: string;
  createdAt: string;
  resolvedAt?: string;
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
