import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  glow?: boolean
}

export function Card({ children, className, glow }: CardProps) {
  return (
    <div
      className={cn(
        'glass rounded-2xl p-6 shadow-xl',
        glow && 'shadow-aura-500/10 dark:shadow-aura-400/10',
        className,
      )}
    >
      {children}
    </div>
  )
}
