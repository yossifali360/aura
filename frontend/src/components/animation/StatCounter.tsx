import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { cn } from '@/utils/cn'

interface StatCounterProps {
  end: number
  suffix?: string
  decimals?: number
  start?: number
  duration?: number
  delay?: number
  className?: string
}

function formatValue(value: number, decimals: number, suffix: string) {
  const formatted = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value))
  return `${formatted}${suffix}`
}

export function StatCounter({
  end,
  suffix = '',
  decimals = 0,
  start = 1,
  duration = 2,
  delay = 0.5,
  className,
}: StatCounterProps) {
  const ref = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        el.textContent = formatValue(end, decimals, suffix)
        return
      }

      const counter = { val: start }
      el.textContent = formatValue(start, decimals, suffix)

      gsap.to(counter, {
        val: end,
        duration,
        delay,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = formatValue(counter.val, decimals, suffix)
        },
      })
    },
    { scope: ref, dependencies: [end, suffix, decimals, start, duration, delay] },
  )

  return (
    <p ref={ref} className={cn('font-display text-2xl font-bold text-aura-600 dark:text-aura-400 md:text-3xl', className)}>
      {formatValue(start, decimals, suffix)}
    </p>
  )
}
