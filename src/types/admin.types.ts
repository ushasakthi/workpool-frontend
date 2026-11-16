import { AdminAction } from '@/constants/admin-action.enum';
import { BookingStatus } from '@/constants/booking-status.enum';
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
