import { useState } from 'react'
import { cn } from '@/utils/cn'

interface DiscordAvatarProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  loading?: 'lazy' | 'eager'
}

/**
 * Discord CDN blocks hotlinked images unless referrer is stripped.
 */
export function DiscordAvatar({
  src,
  alt,
  className,
  fallbackSrc,
  loading = 'lazy',
}: DiscordAvatarProps) {
  const [failed, setFailed] = useState(false)
  const resolved = failed && fallbackSrc ? fallbackSrc : src

  return (
    <img
      src={resolved}
      alt={alt}
      className={cn(className)}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => {
        if (!failed) setFailed(true)
      }}
    />
  )
}
