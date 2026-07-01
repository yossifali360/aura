import axiosInstance from '@/config/axios'

export async function fetchDiscordAvatars(ids: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(ids.filter((id) => /^\d{17,20}$/.test(id)))]
  if (unique.length === 0) return {}

  const { data } = await axiosInstance.get<{ data: Record<string, string> }>('/discord/avatars', {
    params: { ids: unique.join(',') },
  })

  return data.data ?? {}
}
