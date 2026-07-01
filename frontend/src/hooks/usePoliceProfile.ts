import { useQuery } from '@tanstack/react-query'
import { fetchMyPoliceProfile } from '@/api/police'
import { useAuthStore } from '@/store/authStore'

export const policeProfileQueryKey = ['police', 'me'] as const

export function usePoliceProfile() {
  const { user, token } = useAuthStore()
  const enabled = Boolean(user && token)

  const query = useQuery({
    queryKey: policeProfileQueryKey,
    queryFn: fetchMyPoliceProfile,
    enabled,
  })

  const profile = query.data ?? null

  return {
    profile,
    loading: enabled && query.isPending,
    hasProfile: Boolean(profile),
    notFound: enabled && query.isSuccess && profile === null,
    isError: query.isError,
    refetch: query.refetch,
  }
}
