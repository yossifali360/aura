import axiosInstance from '@/config/axios'
import type { AllRulesContent, ApiResponse, ApplicationTypeSettings } from '@/types'

let cached: ApplicationTypeSettings | null = null
let inflight: Promise<ApplicationTypeSettings> | null = null

let rulesCached: AllRulesContent | null = null
let rulesInflight: Promise<AllRulesContent> | null = null

export async function fetchApplicationTypes(): Promise<ApplicationTypeSettings> {
  if (cached) return cached
  if (inflight) return inflight

  inflight = axiosInstance
    .get<ApiResponse<ApplicationTypeSettings>>('/settings/application-types')
    .then(({ data }) => {
      cached = data.data
      return data.data
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function clearApplicationTypesCache(): void {
  cached = null
}

export async function fetchRules(): Promise<AllRulesContent> {
  if (rulesCached) return rulesCached
  if (rulesInflight) return rulesInflight

  rulesInflight = axiosInstance
    .get<ApiResponse<AllRulesContent>>('/settings/rules')
    .then(({ data }) => {
      rulesCached = data.data
      return data.data
    })
    .finally(() => {
      rulesInflight = null
    })

  return rulesInflight
}

export function clearRulesCache(): void {
  rulesCached = null
}
