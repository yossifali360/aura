import { create } from 'zustand'
import { fetchRules, clearRulesCache } from '@/api/settings'
import type { AllRulesContent, ApplicationType, Language, RulesLocaleContent } from '@/types'

interface RulesState {
  rules: AllRulesContent | null
  isLoading: boolean
  load: () => Promise<void>
  refresh: () => Promise<void>
  getForType: (type: ApplicationType, locale: Language) => RulesLocaleContent | null
}

export const useRulesStore = create<RulesState>((set, get) => ({
  rules: null,
  isLoading: false,

  load: async () => {
    if (get().rules) return
    set({ isLoading: true })
    try {
      const rules = await fetchRules()
      set({ rules, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  refresh: async () => {
    clearRulesCache()
    set({ isLoading: true })
    try {
      const rules = await fetchRules()
      set({ rules, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  getForType: (type, locale) => get().rules?.[type]?.[locale] ?? null,
}))
