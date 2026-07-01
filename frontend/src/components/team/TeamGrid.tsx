import { TeamMemberCard } from '@/components/team/TeamMemberCard'
import type { TeamMember } from '@/data/team'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { useDiscordAvatars } from '@/hooks/useDiscordAvatars'
import { getTeamGridClass } from '@/utils/teamGrid'
import { cn } from '@/utils/cn'

interface TeamGridProps {
  members: TeamMember[]
  emptyMessage: string
}

export function TeamGrid({ members, emptyMessage }: TeamGridProps) {
  const avatars = useDiscordAvatars(members.map((member) => member.discordId))

  if (members.length === 0) {
    return (
      <p className="text-center text-slate-500">{emptyMessage}</p>
    )
  }

  return (
    <RevealOnScroll className={cn('grid gap-6', getTeamGridClass(members.length))}>
      {members.map((member) => (
        <TeamMemberCard
          key={`${member.badgeNumber ?? member.discordId}-${member.roleKey}`}
          member={{
            ...member,
            avatarUrl: member.avatarUrl ?? avatars[member.discordId],
          }}
        />
      ))}
    </RevealOnScroll>
  )
}
