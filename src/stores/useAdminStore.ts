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
  resolve: (id: string, status: ReportStatus.REVIEWED | ReportStatus.DISMISSED) => Promise<void>;

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

  // once resolved it's no longer open, so it leaves the queue
  resolve: async (id, status) => {
    await resolveReport(id, status);
    set((state) => ({
      openReports: state.openReports?.filter((report) => report.id !== id) ?? null,
    }));
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
