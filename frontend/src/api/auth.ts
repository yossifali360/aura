import axiosInstance from '@/config/axios'
import type { ApiResponse, User } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000'

export const getDiscordLoginUrl = (): string => `${API_BASE}/api/auth/discord/redirect`

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await axiosInstance.get<ApiResponse<User>>('/user')
  return data.data
}
