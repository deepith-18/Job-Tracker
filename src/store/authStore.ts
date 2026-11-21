import { create } from 'zustand';
import type { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  authError: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthError: (authError: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  authError: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setAuthError: (authError) => set({ authError }),
}));
