import { create } from 'zustand';
import { UserProfile, UserRole } from '@/types';

interface AuthState {
    user: UserProfile | null;
    loading: boolean;
    setUser: (user: UserProfile | null) => void;
    setLoading: (loading: boolean) => void;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types';

interface AuthState {
    user: UserProfile | null;
    loading: boolean;
    setUser: (user: UserProfile | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            loading: false,
            setUser: (user) => set({ user }),
            setLoading: (loading) => set({ loading }),
        }),
        {
            name: 'zelo-auth-cache', // unique name for the localStorage key
            partialize: (state) => ({ user: state.user }), // only cache the user object, not the loading state
        }
    )
);
