export type ApplicationType = 'server' | 'police' | 'ems'

export interface ApplicationTypeSettings {
  server: boolean
  police: boolean
  ems: boolean
}

export type AdminRole = 'super_admin' | 'whitelist_admin' | 'police_admin' | 'ems_admin' | 'users_admin'

export interface User {
  id: number
  discord_id: string
  username: string
  first_name: string
  email: string | null
  avatar: string | null
  admin_role: AdminRole | null
  is_admin: boolean
}

export interface Application {
  id: number
  type: ApplicationType
  age: number
  experience: string
  character_concept: string
  why_join: string
  rules_accepted: boolean
  status: 'pending' | 'approved' | 'rejected'
  user?: User
}

export interface ApplicationFormData {
  type: ApplicationType
  age: number
  experience: string
  character_concept: string
  why_join: string
  rules_accepted: boolean
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

export interface AdminStats {
  applications_by_status: Record<string, number>
  applications_by_type: Record<string, number>
  contact_messages: number
}

export interface PaginatedMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  meta?: PaginatedMeta
}

export type Language = 'en' | 'ar'

export interface RulesLocaleContent {
  title: string
  subtitle: string
  content: string
}

export interface RulesByLocale {
  en: RulesLocaleContent
  ar: RulesLocaleContent
}

export interface AllRulesContent {
  server: RulesByLocale
  police: RulesByLocale
  ems: RulesByLocale
}

/** @deprecated Use AllRulesContent or RulesByLocale */
export interface RulesContent extends RulesByLocale {}

export type Theme = 'light' | 'dark'
