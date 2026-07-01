import axios from 'axios'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { fetchCurrentUser } from '@/api/auth'

const AUTH_STORAGE_KEY = 'aura-auth'

function readPersistedAuth(): { token: string | null; user: User | null } {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return { token: null, user: null }

    const parsed = JSON.parse(raw) as { state?: { token?: string | null; user?: User | null } }
    return {
      token: parsed.state?.token ?? null,
      user: parsed.state?.user ?? null,
    }
  } catch {
    return { token: null, user: null }
  }
}

const bootAuth = typeof window !== 'undefined' ? readPersistedAuth() : { token: null, user: null }

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  hasHydrated: boolean
  setToken: (token: string) => Promise<void>
  fetchUser: () => Promise<void>
  logout: () => void
}

let inflightFetchUser: Promise<void> | null = null

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: bootAuth.user,
      token: bootAuth.token,
      isLoading: false,
      hasHydrated: typeof window !== 'undefined',

      setToken: async (token: string) => {
        set({ token, user: null })
        await get().fetchUser()
      },

      fetchUser: async () => {
        const { token, user } = get()

        if (!token) {
          set({ user: null, isLoading: false })
          return
        }

        if (inflightFetchUser) {
          await inflightFetchUser
          return
        }

        inflightFetchUser = (async () => {
          if (!user) {
            set({ isLoading: true })
          }

          try {
            const freshUser = await fetchCurrentUser()
            set({ user: freshUser, isLoading: false })
          } catch (error) {
            const isUnauthorized = axios.isAxiosError(error) && error.response?.status === 401
            set({
              user: null,
              token: isUnauthorized ? null : get().token,
              isLoading: false,
            })
          }
        })()

        try {
          await inflightFetchUser
        } finally {
          inflightFetchUser = null
        }
      },

      logout: () => {
        set({ user: null, token: null, isLoading: false })
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true })
      },
    },
  ),
)

export function isAuthPending(state: Pick<AuthState, 'hasHydrated' | 'token' | 'user' | 'isLoading'>) {
  return !state.hasHydrated || (Boolean(state.token) && !state.user && state.isLoading)
}
