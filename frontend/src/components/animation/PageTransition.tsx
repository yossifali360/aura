import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from '@/lib/gsap'

type PageTransitionProps = {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return

      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
      )
    },
    { dependencies: [location.pathname], scope: containerRef },
  )

  return (
    <div ref={containerRef} key={location.pathname}>
      {children}
    </div>
  )
}
