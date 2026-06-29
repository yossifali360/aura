import axiosInstance from '@/config/axios'
import type { ApiResponse, Application, ApplicationFormData, ApplicationType } from '@/types'

const inflight = new Map<string, Promise<Application | null>>()

export async function submitApplication(payload: ApplicationFormData): Promise<Application> {
  const { data } = await axiosInstance.post<ApiResponse<Application>>('/applications', payload)
  inflight.delete(payload.type)
  return data.data
}

export async function fetchMyApplication(type: ApplicationType): Promise<Application | null> {
  const key = type
  const existing = inflight.get(key)
  if (existing) return existing

  const promise = axiosInstance
    .get<ApiResponse<Application | null>>('/applications/me', { params: { type } })
    .then(({ data }) => data.data)
    .finally(() => inflight.delete(key))

  inflight.set(key, promise)
  return promise
}
