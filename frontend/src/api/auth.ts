import axiosInstance from '@/config/axios'
import { API_BASE_URL } from '@/config/api'
import type { ApiResponse, User } from '@/types'

export const getDiscordLoginUrl = (): string => `${API_BASE_URL}/api/auth/discord/redirect`

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await axiosInstance.get<ApiResponse<User>>('/user')
  return data.data
}
