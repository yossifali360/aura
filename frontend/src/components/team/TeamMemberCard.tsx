import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { TeamMember } from '@/data/team'
import { getDiscordAvatarUrl } from '@/utils/discordAvatar'

interface TeamMemberCardProps {
  member: TeamMember
  showCharacterName?: boolean
}

export function TeamMemberCard({ member, showCharacterName }: TeamMemberCardProps) {
  const { t } = useTranslation()
  const [imageFailed, setImageFailed] = useState(false)
  const avatar = imageFailed
    ? getDiscordAvatarUrl('', undefined, member.name)
    : getDiscordAvatarUrl(member.discordId, member.avatarUrl, member.name)
  const role = t(`team.roles.${member.roleKey}`, member.roleKey)

  return (
    <Card glow className="group text-center transition hover:-translate-y-1">
      <div className="mx-auto mb-4 size-24 overflow-hidden rounded-2xl ring-2 ring-aura-500/20 transition group-hover:ring-aura-500/50">
        <img
          src={avatar}
          alt={member.name}
          className="size-full object-cover"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      </div>
      <h3 className="font-display text-lg font-bold">{member.name}</h3>
      {showCharacterName && member.characterName && (
        <p className="mt-1 text-sm text-aura-600 dark:text-aura-400">
          {t('team.character_name')}: {member.characterName}
        </p>
      )}
      <Badge variant="success" className="mt-3">
        {role}
      </Badge>
    </Card>
  )
}
