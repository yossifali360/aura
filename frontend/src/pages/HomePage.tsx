import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Ambulance,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Crown,
  FileText,
  LogIn,
  MessageCircle,
  Shield,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { TeamPreviewSection } from '@/components/team/TeamPreviewSection'
import { StatCounter } from '@/components/animation/StatCounter'
import { getTeamMembers } from '@/data/team'
import { gsap } from '@/lib/gsap'

const stats = [
  { key: 'stats_players', end: 128, suffix: '+' },
  { key: 'stats_uptime', end: 99.9, suffix: '%', decimals: 1 },
  { key: 'stats_jobs', end: 40, suffix: '+' },
]

const features = [
  { icon: Briefcase, titleKey: 'economy_title', descKey: 'economy_desc' },
  { icon: Shield, titleKey: 'police_title', descKey: 'police_desc' },
  { icon: Calendar, titleKey: 'events_title', descKey: 'events_desc' },
  { icon: Users, titleKey: 'support_title', descKey: 'support_desc' },
]

const howStepIcons = [LogIn, FileText, Users, CheckCircle2]

const departments = [
  {
    key: 'whitelist',
    icon: Users,
    applyTo: '/apply',
    rulesTo: '/rules',
    teamTo: null,
    color: 'from-aura-500/20 to-aura-400/20 text-aura-600 dark:text-aura-400',
  },
  {
    key: 'police',
    icon: Shield,
    applyTo: '/apply/police',
    rulesTo: '/rules/police',
    teamTo: '/team/police',
    color: 'from-slate-500/20 to-aura-500/15 text-slate-600 dark:text-slate-300',
  },
  {
    key: 'ems',
    icon: Ambulance,
    applyTo: '/apply/ems',
    rulesTo: '/rules/ems',
    teamTo: '/team/ems',
    color: 'from-aura-600/20 to-aura-400/15 text-aura-700 dark:text-aura-300',
  },
] as const

const DISCORD_INVITE_URL = 'https://discord.gg/aac'

export function HomePage() {
  const { t } = useTranslation()
  const heroRef = useRef<HTMLDivElement>(null)

  const howSteps = t('home.how_steps', { returnObjects: true }) as { title: string; desc: string }[]

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('.hero-badge', { y: -20, opacity: 0, duration: 0.5 })
        .from('.hero-title', { y: 40, opacity: 0, duration: 0.7 }, '-=0.2')
        .from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.55 }, '-=0.35')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.45, stagger: 0.1 }, '-=0.25')
        .from('.hero-stat', { scale: 0.8, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.2')
    },
    { scope: heroRef },
  )

  return (
    <div className="grid-bg">
      <section ref={heroRef} className="relative overflow-hidden px-4 py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-aura-500/5 to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="hero-badge mb-4 inline-block rounded-full border border-aura-500/30 bg-aura-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-aura-600 dark:text-aura-400">
            {t('hero.badge')}
          </span>
          <h1 className="hero-title font-display text-4xl font-black leading-tight md:text-6xl">
            <span className="neon-text">{t('hero.title')}</span>
          </h1>
          <p className="hero-subtitle mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            {t('hero.subtitle')}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/apply" className="hero-cta">
              <Button size="lg">
                {t('hero.cta_apply')}
                <ArrowRight className="size-5" />
              </Button>
            </Link>
            <Link to="/apply/police" className="hero-cta">
              <Button variant="secondary" size="lg">
                {t('nav.police')}
              </Button>
            </Link>
            <Link to="/apply/ems" className="hero-cta">
              <Button variant="secondary" size="lg">
                {t('nav.ems')}
              </Button>
            </Link>
            <Link to="/rules" className="hero-cta">
              <Button variant="ghost" size="lg">
                {t('hero.cta_rules')}
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-4">
            {stats.map(({ key, end, suffix, decimals }) => (
              <div key={key} className="hero-stat glass rounded-2xl p-4">
                <StatCounter end={end} suffix={suffix} decimals={decimals} />
                <p className="mt-1 text-xs text-slate-500 md:text-sm">{t(`hero.${key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center font-display text-3xl font-bold">{t('features.title')}</h2>
          <RevealOnScroll className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, titleKey, descKey }) => (
              <Card key={titleKey} glow className="group transition hover:-translate-y-1">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-aura-500/15 text-aura-600 transition group-hover:scale-110 dark:text-aura-400">
                  <Icon className="size-6" />
                </div>
                <h3 className="font-display text-lg font-bold">{t(`features.${titleKey}`)}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t(`features.${descKey}`)}</p>
              </Card>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold">{t('home.how_title')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
              {t('home.how_subtitle')}
            </p>
          </div>
          <RevealOnScroll className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howSteps.map((step, index) => {
              const Icon = howStepIcons[index] ?? CheckCircle2
              return (
                <Card key={step.title} glow className="relative overflow-hidden">
                  <span className="absolute end-3 top-1 font-display text-6xl font-black text-aura-500/10">
                    {index + 1}
                  </span>
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-aura-500/15 text-aura-600 dark:text-aura-400">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{step.desc}</p>
                </Card>
              )
            })}
          </RevealOnScroll>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold">{t('home.departments_title')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
              {t('home.departments_subtitle')}
            </p>
          </div>
          <RevealOnScroll className="grid gap-6 lg:grid-cols-3">
            {departments.map(({ key, icon: Icon, applyTo, rulesTo, teamTo, color }) => (
              <Card key={key} glow className="flex flex-col">
                <div className={`mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}>
                  <Icon className="size-6" />
                </div>
                <h3 className="font-display text-xl font-bold">
                  {t(`home.departments.${key}.title`)}
                </h3>
                <p className="mt-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
                  {t(`home.departments.${key}.desc`)}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link to={applyTo}>
                    <Button size="sm">
                      {t(`home.departments.${key}.apply`)}
                    </Button>
                  </Link>
                  <Link to={rulesTo}>
                    <Button variant="secondary" size="sm">
                      {t(`home.departments.${key}.rules`)}
                    </Button>
                  </Link>
                  {teamTo && (
                    <Link to={teamTo}>
                      <Button variant="ghost" size="sm">
                        {t('team.meet_team')}
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      <TeamPreviewSection
        members={getTeamMembers('admin')}
        teamTo="/team"
        titleKey="home.owners_title"
        subtitleKey="home.owners_subtitle"
        icon={Crown}
        maxPreview={3}
      />

      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <RevealOnScroll>
            <Card
              glow
              className="relative overflow-hidden border-[#5865F2]/30 bg-gradient-to-br from-[#5865F2]/10 via-transparent to-transparent"
            >
              <div className="pointer-events-none absolute -end-8 -top-8 size-40 rounded-full bg-[#5865F2]/10 blur-3xl" />
              <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:text-start">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-[#5865F2]/20 text-[#5865F2]">
                  <MessageCircle className="size-10" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-bold md:text-3xl">{t('home.discord_title')}</h2>
                  <p className="mt-3 text-slate-600 dark:text-slate-400">{t('home.discord_subtitle')}</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    {(t('home.discord_benefits', { returnObjects: true }) as string[]).map((item) => (
                      <li key={item} className="flex items-center gap-2 md:justify-start justify-center">
                        <span className="size-1.5 shrink-0 rounded-full bg-[#5865F2]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Button
                    size="lg"
                    className="bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/30 hover:bg-[#4752C4]"
                  >
                    <MessageCircle className="size-5" />
                    {t('home.discord_join')}
                  </Button>
                </a>
              </div>
            </Card>
          </RevealOnScroll>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl">
          <RevealOnScroll>
            <Card
              glow
              className="relative overflow-hidden border-aura-500/20 bg-gradient-to-br from-aura-500/10 via-transparent to-transparent text-center"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),transparent_55%)]" />
              <div className="relative">
                <h2 className="font-display text-3xl font-bold md:text-4xl">{t('home.cta_title')}</h2>
                <p className="mx-auto mt-4 max-w-xl text-slate-600 dark:text-slate-400">
                  {t('home.cta_subtitle')}
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link to="/apply">
                    <Button size="lg">
                      {t('home.cta_apply')}
                      <ArrowRight className="size-5" />
                    </Button>
                  </Link>
                  <a
                    href={DISCORD_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" size="lg">
                      <MessageCircle className="size-5" />
                      {t('home.discord_join')}
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  )
}
