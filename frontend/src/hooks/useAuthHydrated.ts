import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated())

  useEffect(() => {
    setHydrated(useAuthStore.persist.hasHydrated())

    return useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
  }, [])

  return hydrated
}
