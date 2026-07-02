import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { fetchDiscordTeamMembers, type DiscordRoleMember } from '@/api/discord'
import { DiscordAvatar } from '@/components/ui/DiscordAvatar'
import { getTeamGridClass } from '@/utils/teamGrid'
import { getDiscordAvatarUrl } from '@/utils/discordAvatar'
import { cn } from '@/utils/cn'

function DiscordTeamMemberCard({ member }: { member: DiscordRoleMember }) {
  const fallbackAvatar = getDiscordAvatarUrl(member.discord_id, undefined, member.name)

  return (
    <Card glow className="group text-center transition hover:-translate-y-1">
      <div className="mx-auto mb-4 size-24 overflow-hidden rounded-2xl ring-2 ring-aura-500/20 transition group-hover:ring-aura-500/50">
        <DiscordAvatar
          src={member.avatar || fallbackAvatar}
          fallbackSrc={fallbackAvatar}
          alt={member.name}
          className="size-full object-cover"
        />
      </div>
      <h3 className="font-display text-lg font-bold">{member.name}</h3>
      <p className="mt-1 text-xs text-slate-500">@{member.username}</p>
      {member.role && (
        <Badge variant="success" className="mt-3">
          {member.role}
        </Badge>
      )}
    </Card>
  )
}

export function DiscordTeamGrid() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [members, setMembers] = useState<DiscordRoleMember[]>([])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)

    fetchDiscordTeamMembers()
      .then((payload) => {
        if (!active) return
        setMembers(payload.members ?? [])
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <span className="size-8 animate-spin rounded-full border-2 border-aura-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <p className="text-slate-600 dark:text-slate-400">{t('team.discord_role.error')}</p>
        <Button className="mt-4" size="sm" onClick={() => window.location.reload()}>
          {t('common.retry', 'Try again')}
        </Button>
      </Card>
    )
  }

  if (members.length === 0) {
    return <p className="text-center text-slate-500">{t('team.discord_role.empty')}</p>
  }

  return (
    <RevealOnScroll className={cn('grid gap-6', getTeamGridClass(members.length))}>
      {members.map((member) => (
        <DiscordTeamMemberCard key={member.discord_id} member={member} />
      ))}
    </RevealOnScroll>
  )
}
