import { ReportCategory } from '@/constants/report-category.enum';

export const REPORT_CATEGORY_LABEL: Record<ReportCategory, string> = {
  [ReportCategory.NO_SHOW]: 'No-show',
  [ReportCategory.LATE_PICKUP]: 'Late pickup',
  [ReportCategory.UNSAFE_DRIVING]: 'Unsafe driving',
  [ReportCategory.INAPPROPRIATE_BEHAVIOUR]: 'Inappropriate behaviour',
  [ReportCategory.OTHER]: 'Other',
};

// flagged "Safety" in the admin queue so they get looked at first
export const SAFETY_CATEGORIES: ReportCategory[] = [
  ReportCategory.UNSAFE_DRIVING,
  ReportCategory.INAPPROPRIATE_BEHAVIOUR,
];

// short readable reference for admins, e.g. "R-C558"
export function reportCode(id: string): string {
  return `R-${id.slice(-4).toUpperCase()}`;
}
