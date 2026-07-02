import axiosInstance from '@/config/axios'

export interface DiscordRoleMember {
  discord_id: string
  name: string
  username: string
  avatar: string
  role: string
  role_id: string
}

export interface DiscordTeamMembersPayload {
  members: DiscordRoleMember[]
}

function flattenGroupsToMembers(
  groups: Array<{ members: DiscordRoleMember[] }>,
): DiscordRoleMember[] {
  return groups.flatMap((group) => group.members)
}

export async function fetchDiscordAvatars(ids: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(ids.filter((id) => /^\d{17,20}$/.test(id)))]
  if (unique.length === 0) return {}

  const { data } = await axiosInstance.get<{ data: Record<string, string> }>('/discord/avatars', {
    params: { ids: unique.join(',') },
  })

  return data.data ?? {}
}

export async function fetchDiscordTeamMembers(): Promise<DiscordTeamMembersPayload> {
  const { data } = await axiosInstance.get<{
    data: DiscordTeamMembersPayload & {
      groups?: Array<{ role: { id: string; name: string }; members: DiscordRoleMember[] }>
      roles?: Array<{ id: string; name: string }>
    }
  }>('/discord/team/members')

  const payload = data.data

  if (Array.isArray(payload?.members)) {
    return { members: payload.members }
  }

  if (Array.isArray(payload?.groups)) {
    return { members: flattenGroupsToMembers(payload.groups) }
  }

  if (Array.isArray(payload?.roles) && Array.isArray(payload.members)) {
    return { members: payload.members }
  }

  return { members: [] }
}

export async function fetchDiscordRoleMembers(roleKey: string): Promise<DiscordTeamMembersPayload> {
  const { data } = await axiosInstance.get<{
    data: { role: { id: string; name: string }; members: Omit<DiscordRoleMember, 'role' | 'role_id'>[] }
  }>(`/discord/roles/${roleKey}/members`)

  return {
    members: data.data.members.map((member) => ({
      ...member,
      role: data.data.role?.name ?? '',
      role_id: data.data.role?.id ?? '',
    })),
  }
}
