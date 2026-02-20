import { create } from 'zustand';
import { UserProfile, UserRole } from '@/types';

interface AuthState {
    user: UserProfile | null;
    loading: boolean;
    setUser: (user: UserProfile | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: false,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
}));
