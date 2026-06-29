import { create } from 'zustand'
import { fetchApplicationTypes, clearApplicationTypesCache } from '@/api/settings'
import type { ApplicationTypeSettings } from '@/types'

interface ApplicationSettingsState {
  settings: ApplicationTypeSettings | null
  isLoading: boolean
  load: () => Promise<void>
  refresh: () => Promise<void>
  isEnabled: (type: keyof ApplicationTypeSettings) => boolean
}

export const useApplicationSettingsStore = create<ApplicationSettingsState>((set, get) => ({
  settings: null,
  isLoading: false,

  load: async () => {
    if (get().settings) return
    set({ isLoading: true })
    try {
      const settings = await fetchApplicationTypes()
      set({ settings, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  refresh: async () => {
    clearApplicationTypesCache()
    set({ isLoading: true })
    try {
      const settings = await fetchApplicationTypes()
      set({ settings, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  isEnabled: (type) => get().settings?.[type] ?? false,
}))
