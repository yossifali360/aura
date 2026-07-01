/* @refresh reset */
import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap } from '@/lib/gsap'

const BRAND = 'Aura Cfw'

type AppLoaderProps = {
  onComplete: () => void
}

export function AppLoader({ onComplete }: AppLoaderProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduced) {
        onComplete()
        setVisible(false)
        return
      }

      const tl = gsap.timeline({
        onComplete: () => {
          setVisible(false)
          onComplete()
        },
      })

      tl.from('.loader-ring', {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'back.out(2)',
      })
        .from(
          '.loader-icon',
          { scale: 0, rotation: -180, duration: 0.5, ease: 'back.out(2)' },
          '-=0.3',
        )
        .from(
          '.loader-letter',
          {
            y: 40,
            opacity: 0,
            rotateX: -90,
            duration: 0.45,
            stagger: 0.04,
            ease: 'power3.out',
          },
          '-=0.2',
        )
        .from('.loader-tagline', { opacity: 0, y: 10, duration: 0.35 }, '-=0.1')
        .to('.loader-progress-fill', { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, '-=0.5')
        .to('.loader-orb', { opacity: 0.6, scale: 1, duration: 1, stagger: 0.1, ease: 'sine.out' }, 0)
        .to('.loader-content', { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in' }, '+=0.15')
        .to(containerRef.current, { opacity: 0, duration: 0.4, ease: 'power2.in' }, '-=0.2')

      gsap.to('.loader-ring', {
        rotation: 360,
        duration: 8,
        repeat: -1,
        ease: 'none',
      })

      gsap.to('.loader-orb', {
        y: '+=20',
        x: '+=10',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { each: 0.4, from: 'random' },
      })
    },
    { scope: containerRef },
  )

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950"
      dir="ltr"
      aria-hidden="true"
    >
      <div className="loader-orb pointer-events-none absolute left-[15%] top-[20%] size-32 rounded-full bg-aura-500/15 blur-3xl opacity-0" />
      <div className="loader-orb pointer-events-none absolute bottom-[25%] right-[10%] size-40 rounded-full bg-aura-600/10 blur-3xl opacity-0" />
      <div className="loader-orb pointer-events-none absolute right-[30%] top-[35%] size-24 rounded-full bg-aura-400/10 blur-2xl opacity-0" />

      <div className="loader-content relative flex flex-col items-center">
        <div className="relative mb-8 flex size-28 items-center justify-center">
          <span className="loader-ring absolute inset-0 rounded-full border border-aura-500/25" />
          <span className="loader-ring absolute inset-2 rounded-full border border-aura-400/20" />
          <span className="loader-ring absolute inset-4 rounded-full border border-aura-300/15" />
          <img
            src="/image.png"
            alt=""
            className="loader-icon relative size-20 object-contain mix-blend-screen drop-shadow-[0_0_18px_rgba(239,68,68,0.4)]"
          />
        </div>

        <h1
          className="flex overflow-hidden font-display text-3xl font-black tracking-wider text-aura-400 md:text-4xl"
          dir="ltr"
          aria-label={BRAND}
        >
          {BRAND.split('').map((char, i) => (
            <span
              key={i}
              className="loader-letter inline-block"
              style={{ perspective: '400px' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        <p
          className="loader-tagline mt-2 text-sm tracking-normal text-slate-500"
          dir="rtl"
          lang="ar"
        >
          {t('loader.tagline')}
        </p>

        <div className="loader-progress mt-10 h-0.5 w-48 overflow-hidden rounded-full bg-slate-800">
          <div className="loader-progress-fill h-full w-full origin-left scale-x-0 rounded-full bg-aura-500" />
        </div>
      </div>
    </div>
  )
}
