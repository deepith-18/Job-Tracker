import { create } from 'zustand';
import type { Application, SortKey } from '../types';

interface ApplicationState {
  applications: Application[];
  loading: boolean;
  error: string | null;
  sortKey: SortKey;
  setApplications: (apps: Application[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSortKey: (key: SortKey) => void;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  applications: [],
  loading: true,
  error: null,
  sortKey: 'updatedAt',
  setApplications: (applications) => set({ applications, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  setSortKey: (sortKey) => set({ sortKey }),
}));
