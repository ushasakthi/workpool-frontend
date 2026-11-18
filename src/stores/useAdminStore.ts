import { create } from 'zustand';

import {
  getAdminStats,
  listActionLog,
  listReports,
  listUsers,
  resolveReport,
  setUserSuspended,
  type ListUsersQuery,
} from '@/api/admin.api';
import type { ReportSeverity } from '@/constants/report-severity.enum';
import { ReportStatus } from '@/constants/report-status.enum';
import type { ActionLogEntry, AdminStats, AdminUsersPage } from '@/types/admin.types';
import type { AdminReport } from '@/types/report.types';

// typing in the search box fires several requests; only the newest may update the list
let latestUsersRequest = 0;

interface AdminState {
  // dashboard numbers + sidebar counts; null = loading
  stats: AdminStats | null;
  statsLoadedAt: Date | null;
  loadStats: () => Promise<void>;

  // open reports, oldest first; null = loading
  openReports: AdminReport[] | null;
  loadOpenReports: () => Promise<void>;
  resolve: (
    id: string,
    status: ReportStatus.REVIEWED | ReportStatus.DISMISSED,
    severity?: ReportSeverity,
  ) => Promise<void>;
  // upheld and dismissed reports, newest decision first; null = loading
  reportHistory: AdminReport[] | null;
  loadReportHistory: () => Promise<void>;

  // users matching the current filters; null = loading
  users: AdminUsersPage | null;
  loadUsers: (query: ListUsersQuery) => Promise<void>;
  setSuspended: (id: string, suspended: boolean, reason?: string) => Promise<void>;

  actionLog: ActionLogEntry[] | null;
  loadActionLog: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: null,
  statsLoadedAt: null,

  loadStats: async () => {
    const stats = await getAdminStats();
    set({ stats, statsLoadedAt: new Date() });
  },

  openReports: null,

  loadOpenReports: async () => {
    set({ openReports: await listReports(ReportStatus.OPEN) });
  },

  // once resolved it leaves the queue and joins the history (reloaded next time it's opened)
  resolve: async (id, status, severity) => {
    await resolveReport(id, status, severity);
    set((state) => ({
      openReports: state.openReports?.filter((report) => report.id !== id) ?? null,
      reportHistory: null,
    }));
  },

  reportHistory: null,

  loadReportHistory: async () => {
    const all = await listReports();
    const decided = all
      .filter((report) => report.status !== ReportStatus.OPEN)
      .sort((a, b) => (b.resolvedAt ?? '').localeCompare(a.resolvedAt ?? ''));
    set({ reportHistory: decided });
  },

  users: null,

  loadUsers: async (query) => {
    latestUsersRequest += 1;
    const requestId = latestUsersRequest;
    const page = await listUsers(query);
    if (requestId === latestUsersRequest) {
      set({ users: page });
    }
  },

  setSuspended: async (id, suspended, reason) => {
    const updated = await setUserSuspended(id, suspended, reason);
    set((state) => {
      if (!state.users) return {};
      const change = suspended ? 1 : -1;
      return {
        users: {
          ...state.users,
          items: state.users.items.map((user) => (user.id === id ? updated : user)),
          counts: {
            ...state.users.counts,
            suspended: state.users.counts.suspended + change,
          },
        },
      };
    });
  },

  actionLog: null,

  loadActionLog: async () => {
    set({ actionLog: await listActionLog() });
  },
}));
