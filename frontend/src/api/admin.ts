import axiosInstance from '@/config/axios'
import type { AdminStats, AllRulesContent, ApiResponse, Application, ApplicationTypeSettings, ContactMessage, PaginatedMeta, User, AdminRole } from '@/types'
import type { ApplicationType } from '@/types'

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data } = await axiosInstance.get<ApiResponse<AdminStats>>('/admin/stats')
  return data.data
}

export async function fetchAdminApplications(params?: {
  type?: ApplicationType
  status?: string
  page?: number
}): Promise<{ items: Application[]; meta: PaginatedMeta }> {
  const { data } = await axiosInstance.get<ApiResponse<Application[]>>('/admin/applications', { params })
  return { items: data.data, meta: data.meta! }
}

export async function updateApplicationStatus(id: number, status: Application['status']): Promise<Application> {
  const { data } = await axiosInstance.patch<ApiResponse<Application>>(`/admin/applications/${id}`, { status })
  return data.data
}

export async function deleteApplication(id: number): Promise<void> {
  await axiosInstance.delete(`/admin/applications/${id}`)
}

export interface SendDiscordMessageResult {
  sent: number
  failed: number
  total: number
  failures?: Record<string, string>
}

export async function sendAdminApplicationMessage(
  applicationIds: number[],
  message: string,
): Promise<SendDiscordMessageResult> {
  const { data } = await axiosInstance.post<ApiResponse<SendDiscordMessageResult>>('/admin/applications/message', {
    application_ids: applicationIds,
    message,
  })
  return data.data
}

export async function fetchAdminContacts(page = 1): Promise<{ items: ContactMessage[]; meta: PaginatedMeta }> {
  const { data } = await axiosInstance.get<ApiResponse<ContactMessage[]>>('/admin/contacts', { params: { page } })
  return { items: data.data, meta: data.meta! }
}

export async function fetchAdminUsers(): Promise<User[]> {
  const { data } = await axiosInstance.get<ApiResponse<User[]>>('/admin/users')
  return data.data
}

export async function updateUserRole(id: number, admin_role: AdminRole | null): Promise<User> {
  const { data } = await axiosInstance.patch<ApiResponse<User>>(`/admin/users/${id}`, { admin_role })
  return data.data
}

export async function fetchAdminApplicationTypes(): Promise<ApplicationTypeSettings> {
  const { data } = await axiosInstance.get<ApiResponse<ApplicationTypeSettings>>('/admin/settings/application-types')
  return data.data
}

export async function updateAdminApplicationTypes(settings: ApplicationTypeSettings): Promise<ApplicationTypeSettings> {
  const { data } = await axiosInstance.patch<ApiResponse<ApplicationTypeSettings>>('/admin/settings/application-types', settings)
  return data.data
}

export async function fetchAdminRules(): Promise<AllRulesContent> {
  const { data } = await axiosInstance.get<ApiResponse<AllRulesContent>>('/admin/settings/rules')
  return data.data
}

export async function updateAdminRules(rules: AllRulesContent): Promise<AllRulesContent> {
  const { data } = await axiosInstance.patch<ApiResponse<AllRulesContent>>('/admin/settings/rules', rules)
  return data.data
}
