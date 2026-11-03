import { ReportCategory } from '@/constants/report-category.enum';
import { ReportStatus } from '@/constants/report-status.enum';

// Same shape as backend reports.service.ts AdminReportView (admin screens only)
export interface AdminReport {
  id: string;
  bookingId: string;
  category: ReportCategory;
  reason?: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  reportedBy: { id: string; name: string; email: string };
  reportedUser: {
    id: string;
    name: string;
    role: 'passenger' | 'driver';
    // other reports against this person, any status
    otherReports: number;
  };
}
