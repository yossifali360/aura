import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGSAP } from '@gsap/react'
import { ChevronDown, LogIn, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { LangToggle } from '@/components/layout/LangToggle'
import { useAuthStore } from '@/store/authStore'
import { getDiscordLoginUrl } from '@/api/auth'
import { cn } from '@/utils/cn'
import { gsap } from '@/lib/gsap'

const navItemBase =
  'inline-flex items-center gap-1 rounded-lg px-3 cursor-pointer py-2 text-sm font-medium leading-none transition whitespace-nowrap'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    navItemBase,
    isActive
      ? 'text-aura-600 dark:text-aura-400'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
  )

const navDropdownTriggerClass = (active: boolean) =>
  cn(
    navItemBase,
    active
      ? 'text-aura-600 dark:text-aura-400'
      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
  )

const navDropdownItemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition whitespace-nowrap',
    isActive
      ? 'text-aura-600 dark:text-aura-400'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
  )

export function Navbar() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const headerRef = useRef<HTMLElement>(null)
  const applyRef = useRef<HTMLDivElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)
  const isRtl = i18n.language === 'ar'

  const applyLinks = [
    { to: '/apply', label: t('nav.apply') },
    { to: '/apply/police', label: t('nav.police') },
    { to: '/apply/ems', label: t('nav.ems') },
  ]

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return

      const fromX = isRtl ? 20 : -20
      gsap.from('.nav-brand', { x: fromX, opacity: 0, duration: 0.5, ease: 'power3.out' })
      gsap.from('.nav-item', { y: -12, opacity: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out', delay: 0.1 })
    },
    { scope: headerRef, dependencies: [isRtl] },
  )

  useEffect(() => {
    setMobileOpen(false)
    setApplyOpen(false)
  }, [i18n.language])

  useEffect(() => {
    if (!applyOpen) return

    const handleClick = (e: MouseEvent) => {
      if (applyRef.current && !applyRef.current.contains(e.target as Node)) {
        setApplyOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [applyOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleLogin = () => {
    window.location.href = getDiscordLoginUrl()
  }

  const isApplyActive = applyLinks.some((link) => location.pathname === link.to)

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/80"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="nav-brand flex shrink-0 items-center gap-2 font-display text-lg font-bold">
          <img src="/image.png" alt="Aura Cfw" className="size-9 object-contain" />
          <span className="neon-text hidden sm:inline">Aura Cfw</span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t('nav.home')}>
          <NavLink to="/" className={navLinkClass} end>
            <span className="nav-item">{t('nav.home')}</span>
          </NavLink>

          <div ref={applyRef} className="relative flex items-center">
            <button
              type="button"
              onClick={() => setApplyOpen((open) => !open)}
              className={navDropdownTriggerClass(isApplyActive || applyOpen)}
              aria-expanded={applyOpen}
            >
              <span className="nav-item">{t('nav.apply_menu')}</span>
              <ChevronDown className={cn('size-3.5 shrink-0 opacity-80 transition', applyOpen && 'rotate-180')} />
            </button>

            {applyOpen && (
              <div
                className={cn(
                  'absolute top-full z-50 mt-1 flex min-w-[12rem] flex-col rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900',
                  isRtl ? 'right-0' : 'left-0',
                )}
              >
                {applyLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={navDropdownItemClass}
                    onClick={() => setApplyOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/rules" className={navLinkClass}>
            <span className="nav-item">{t('nav.rules')}</span>
          </NavLink>
          {user?.is_admin && (
            <NavLink to="/admin" className={navLinkClass}>
              <span className="nav-item">{t('nav.admin')}</span>
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <LangToggle className="hidden sm:flex" />
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="hidden items-center gap-2 md:flex">
                <img
                  src={user.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name)}&background=dc2626&color=fff`}
                  alt={user.first_name}
                  className="size-8 rounded-full ring-2 ring-aura-500/40 lg:size-9"
                />
                <span className="hidden max-w-[7rem] truncate text-sm font-semibold xl:inline">
                  {user.first_name}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:inline-flex">
                <LogOut className="size-4" />
                <span className="hidden lg:inline">{t('nav.logout')}</span>
              </Button>
            </div>
          ) : (
            <Button variant="discord" size="sm" onClick={handleLogin} className="hidden sm:inline-flex">
              <LogIn className="size-4" />
              <span className="hidden lg:inline">{t('nav.login')}</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? t('nav.close_menu') : t('nav.open_menu')}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200/50 bg-white/95 px-4 py-4 dark:border-slate-800/50 dark:bg-slate-950/95 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label={t('nav.home')}>
            <NavLink to="/" className={navLinkClass} end onClick={() => setMobileOpen(false)}>
              {t('nav.home')}
            </NavLink>

            <p className="px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
              {t('nav.apply_menu')}
            </p>
            {applyLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            <NavLink to="/rules" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              {t('nav.rules')}
            </NavLink>
            {user?.is_admin && (
              <NavLink to="/admin" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                {t('nav.admin')}
              </NavLink>
            )}
          </nav>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 sm:hidden">
            <LangToggle />
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name)}&background=dc2626&color=fff`}
                    alt={user.first_name}
                    className="size-9 rounded-full ring-2 ring-aura-500/40"
                  />
                  <span className="text-sm font-semibold">{user.first_name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { logout(); setMobileOpen(false) }}>
                  <LogOut className="size-4" />
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <Button variant="discord" size="sm" onClick={handleLogin}>
                <LogIn className="size-4" />
                {t('nav.login')}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
