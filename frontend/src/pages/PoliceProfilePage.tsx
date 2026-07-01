import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft, LogIn, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { fetchMyPoliceProfile } from '@/api/police'
import { getDiscordLoginUrl } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { getDiscordAvatarUrl } from '@/utils/discordAvatar'
import { POLICE_SPECIALTY_FIELDS, type PoliceMember } from '@/types/police'

function formatDate(value: string | null, locale: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function SpecialtyBadge({ status, label }: { status: string; label: string }) {
  const { t } = useTranslation()
  const variant = status === 'certified' ? 'success' : status === 'training' ? 'warning' : 'default'

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-slate-900/40 px-3 py-2 text-center">
      <p className="text-xs font-semibold text-slate-300">{label}</p>
      <Badge variant={variant} className="mt-1">
        {t(`police.specialty_statuses.${status}`, status)}
      </Badge>
    </div>
  )
}

export function PoliceProfilePage() {
  const { t, i18n } = useTranslation()
  const { user, token } = useAuthStore()
  const [profile, setProfile] = useState<PoliceMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!user || !token) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setNotFound(false)

    fetchMyPoliceProfile()
      .then((data) => {
        if (!active) return
        if (!data) {
          setNotFound(true)
          setProfile(null)
        } else {
          setProfile(data)
        }
      })
      .catch(() => {
        if (active) setNotFound(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user, token])

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Card glow className="space-y-4">
          <Shield className="mx-auto size-12 text-aura-500" />
          <h1 className="font-display text-2xl font-bold">{t('police.profile.login_title')}</h1>
          <p className="text-slate-500">{t('police.profile.login_desc')}</p>
          <Button variant="discord" onClick={() => { window.location.href = getDiscordLoginUrl() }}>
            <LogIn className="size-4" />
            {t('nav.login')}
          </Button>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="size-8 animate-spin rounded-full border-2 border-aura-500 border-t-transparent" />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Card glow className="space-y-4">
          <Shield className="mx-auto size-12 text-slate-400" />
          <h1 className="font-display text-2xl font-bold">{t('police.profile.not_found_title')}</h1>
          <p className="text-slate-500">{t('police.profile.not_found_desc')}</p>
          <Link to="/">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="size-4" />
              {t('team.back_home')}
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const avatar = getDiscordAvatarUrl(profile.discord_id ?? '', undefined, profile.name)
  const pointsLabel = profile.points_exempt
    ? t('police.profile.exempt')
    : profile.points?.toString() ?? '0'

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 size-28 overflow-hidden rounded-2xl ring-2 ring-aura-500/30">
          <img src={avatar} alt={profile.name} className="size-full object-cover" />
        </div>
        <h1 className="font-display text-3xl font-bold">{profile.name}</h1>
        <p className="mt-2 text-slate-500">
          {t('police.profile.badge', { number: profile.badge_number })}
        </p>
        <Badge variant="success" className="mt-3">
          {t(`police.ranks.${profile.rank}`, profile.rank)}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-lg font-bold">{t('police.profile.details')}</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">{t('admin.roster.section')}</dt>
              <dd className="font-medium">{t(`police.sections.${profile.section}`)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">{t('admin.roster.status')}</dt>
              <dd className="font-medium">{t(`police.statuses.${profile.status}`)}</dd>
            </div>
            {profile.position && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">{t('admin.roster.position')}</dt>
                <dd className="font-medium">{profile.position}</dd>
              </div>
            )}
            {profile.shoulder_rank && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">{t('admin.roster.shoulder_rank')}</dt>
                <dd className="font-medium">{profile.shoulder_rank}</dd>
              </div>
            )}
            {profile.discord_username && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">{t('admin.roster.discord_username')}</dt>
                <dd className="font-medium">{profile.discord_username}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-bold">{t('police.profile.record')}</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">{t('admin.roster.joined_at')}</dt>
              <dd className="font-medium">{formatDate(profile.joined_at, i18n.language)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">{t('admin.roster.last_promotion')}</dt>
              <dd className="font-medium">{formatDate(profile.last_promotion_date, i18n.language)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">{t('admin.roster.points')}</dt>
              <dd className="font-medium">{pointsLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">{t('admin.roster.warnings')}</dt>
              <dd className="font-medium text-red-500">{profile.warnings}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-4 font-display text-lg font-bold">{t('admin.roster.specialties')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POLICE_SPECIALTY_FIELDS.map((field) => (
            <SpecialtyBadge
              key={field}
              label={t(`police.specialties.${field}`)}
              status={profile[field]}
            />
          ))}
        </div>
      </Card>

      <div className="mt-10 text-center">
        <Link to="/team/police">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="size-4" />
            {t('police.profile.back_team')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
