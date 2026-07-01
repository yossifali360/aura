import axiosInstance from '@/config/axios'
import type { ApiResponse } from '@/types'
import type { PoliceLinkableUser, PoliceMember, PoliceOptions, PoliceRosterGrouped } from '@/types/police'
import { formToPolicePayload, type PoliceMemberFormData } from '@/types/police'

export async function fetchPublicPoliceRoster(): Promise<PoliceRosterGrouped> {
  const { data } = await axiosInstance.get<ApiResponse<PoliceRosterGrouped>>('/police/roster')
  return data.data
}

export async function fetchPoliceOptions(): Promise<PoliceOptions> {
  const { data } = await axiosInstance.get<ApiResponse<PoliceOptions>>('/police/options')
  return data.data
}

export async function fetchMyPoliceProfile(): Promise<PoliceMember | null> {
  const { data } = await axiosInstance.get<ApiResponse<PoliceMember | null>>('/police/me')
  return data.data
}

export async function fetchAdminPoliceMembers(): Promise<PoliceMember[]> {
  const { data } = await axiosInstance.get<ApiResponse<PoliceMember[]>>('/admin/police/members')
  return data.data
}

export async function fetchLinkablePoliceUsers(exceptMemberId?: number): Promise<PoliceLinkableUser[]> {
  const { data } = await axiosInstance.get<ApiResponse<PoliceLinkableUser[]>>('/admin/police/linkable-users', {
    params: exceptMemberId ? { except_member_id: exceptMemberId } : undefined,
  })
  return data.data
}

export async function createPoliceMember(form: PoliceMemberFormData): Promise<PoliceMember> {
  const { data } = await axiosInstance.post<ApiResponse<PoliceMember>>('/admin/police/members', formToPolicePayload(form))
  return data.data
}

export async function updatePoliceMember(id: number, form: PoliceMemberFormData): Promise<PoliceMember> {
  const { data } = await axiosInstance.patch<ApiResponse<PoliceMember>>(`/admin/police/members/${id}`, formToPolicePayload(form))
  return data.data
}

export async function deletePoliceMember(id: number): Promise<void> {
  await axiosInstance.delete(`/admin/police/members/${id}`)
}
