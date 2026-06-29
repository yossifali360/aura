import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

type RevealOnScrollProps = {
  children: React.ReactNode
  className?: string
  stagger?: number
}

export function RevealOnScroll({ children, className, stagger = 0.1 }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const container = ref.current
      if (reduced || !container) return

      const items = gsap.utils.toArray<HTMLElement>(container.children)
      if (!items.length) return

      gsap.set(items, { opacity: 0, y: 40 })

      const tween = gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 92%',
          once: true,
          invalidateOnRefresh: true,
        },
      })

      const playIfVisible = () => {
        const st = tween.scrollTrigger
        if (!st) return

        ScrollTrigger.refresh()
        if (st.isActive && tween.progress() === 0) {
          tween.play()
        }
      }

      requestAnimationFrame(playIfVisible)
      window.addEventListener('load', playIfVisible)

      return () => window.removeEventListener('load', playIfVisible)
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
