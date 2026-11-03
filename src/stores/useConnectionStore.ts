import { create } from 'zustand';

// Set by the API client: offline after a request gets no reply at all,
// back online as soon as any request succeeds. Drives the OfflineBanner.
interface ConnectionState {
  offline: boolean;
  setOffline: (offline: boolean) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  offline: false,
  setOffline: (offline) => set({ offline }),
}));
