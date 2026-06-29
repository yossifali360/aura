import axios from 'axios'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { fetchCurrentUser } from '@/api/auth'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  setToken: (token: string) => Promise<void>
  fetchUser: () => Promise<void>
  logout: () => void
}

let inflightFetchUser: Promise<void> | null = null

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setToken: async (token: string) => {
        set({ token, user: null })
        await get().fetchUser()
      },

      fetchUser: async () => {
        const { token, user } = get()
        if (!token || user) return

        if (inflightFetchUser) {
          await inflightFetchUser
          return
        }

        inflightFetchUser = (async () => {
          set({ isLoading: true })
          try {
            const user = await fetchCurrentUser()
            set({ user, isLoading: false })
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
        set({ user: null, token: null })
      },
    }),
    {
      name: 'aura-auth',
      partialize: (state) => ({ token: state.token }),
    },
  ),
)
