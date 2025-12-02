import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthTokens, User } from '@/types'

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  initialized: boolean
  setSession: (tokens: AuthTokens) => void
  setUser: (user: User | null) => void
  markInitialized: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      initialized: false,
      setSession: (tokens) => set({ tokens }),
      setUser: (user) => set({ user }),
      markInitialized: () => set({ initialized: true }),
      logout: () => set({ user: null, tokens: null, initialized: true }),
    }),
    {
      name: 'dev-timesheets-auth',
      partialize: (state) => ({ tokens: state.tokens, user: state.user }),
    },
  ),
)