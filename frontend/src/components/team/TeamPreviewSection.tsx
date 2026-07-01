// import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { type LucideIcon } from 'lucide-react'
// import { Button } from '@/components/ui/Button'
import { TeamMemberCard } from '@/components/team/TeamMemberCard'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import type { TeamMember } from '@/data/team'
import { useDiscordAvatars } from '@/hooks/useDiscordAvatars'
import { getTeamGridClass } from '@/utils/teamGrid'
import { cn } from '@/utils/cn'

interface TeamPreviewSectionProps {
  members: TeamMember[]
  teamTo: string
  titleKey: string
  subtitleKey: string
  meetTeamKey?: string
  icon?: LucideIcon
  maxPreview?: number
}

export function TeamPreviewSection({
  members,
  teamTo: _teamTo,
  titleKey,
  subtitleKey,
  meetTeamKey: _meetTeamKey = 'team.meet_team',
  icon: Icon,
  maxPreview = 4,
}: TeamPreviewSectionProps) {
  const { t } = useTranslation()
  const preview = members.slice(0, maxPreview)
  const avatars = useDiscordAvatars(preview.map((member) => member.discordId))

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          {Icon && (
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-aura-500/15 text-aura-600 dark:text-aura-400">
              <Icon className="size-6" />
            </div>
          )}
          <h2 className="font-display text-3xl font-bold">{t(titleKey)}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
            {t(subtitleKey)}
          </p>
        </div>

        {preview.length > 0 ? (
          <RevealOnScroll className={cn('grid gap-6', getTeamGridClass(preview.length))}>
            {preview.map((member) => (
              <TeamMemberCard
                key={`${member.badgeNumber ?? member.discordId}-${member.roleKey}`}
                member={{
                  ...member,
                  avatarUrl: member.avatarUrl ?? avatars[member.discordId],
                }}
              />
            ))}
          </RevealOnScroll>
        ) : (
          <p className="text-center text-slate-500">{t('team.empty')}</p>
        )}

        {/* <div className="mt-10 text-center">
          <Link to={teamTo}>
            <Button size="lg">
              {t(meetTeamKey)}
              <ArrowRight className="size-5" />
            </Button>
          </Link>
        </div> */}
      </div>
    </section>
  )
}
