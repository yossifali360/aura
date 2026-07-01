import { useEffect, useState } from 'react'
import { fetchMyPoliceProfile } from '@/api/police'
import { useAuthStore } from '@/store/authStore'
import type { PoliceMember } from '@/types/police'

export function usePoliceProfile() {
  const { user, token } = useAuthStore()
  const [profile, setProfile] = useState<PoliceMember | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || !token) {
      setProfile(null)
      return
    }

    let active = true
    setLoading(true)

    fetchMyPoliceProfile()
      .then((data) => {
        if (active) setProfile(data)
      })
      .catch(() => {
        if (active) setProfile(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user, token])

  return { profile, loading, hasProfile: !!profile }
}
