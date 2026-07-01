import { useEffect, useMemo, useState } from 'react'
import { fetchDiscordAvatars } from '@/api/discord'

export function useDiscordAvatars(ids: string[]): Record<string, string> {
  const [avatars, setAvatars] = useState<Record<string, string>>({})
  const idsKey = useMemo(
    () => [...new Set(ids.filter((id) => /^\d{17,20}$/.test(id)))].sort().join(','),
    [ids],
  )

  useEffect(() => {
    if (!idsKey) {
      setAvatars({})
      return
    }

    let active = true

    fetchDiscordAvatars(idsKey.split(','))
      .then((data) => {
        if (active) setAvatars(data)
      })
      .catch(() => {
        if (active) setAvatars({})
      })

    return () => {
      active = false
    }
  }, [idsKey])

  return avatars
}
