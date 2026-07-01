import { useTranslation } from 'react-i18next'
import { TeamGrid } from '@/components/team/TeamGrid'
import type { PoliceTeamGroup } from '@/data/team'

interface PoliceTeamGroupsProps {
  groups: PoliceTeamGroup[]
  emptyMessage: string
}

export function PoliceTeamGroups({ groups, emptyMessage }: PoliceTeamGroupsProps) {
  const { t } = useTranslation()

  if (groups.every((group) => group.members.length === 0)) {
    return <p className="text-center text-slate-500">{emptyMessage}</p>
  }

  return (
    <div className="space-y-14">
      {groups.map((group) => (
        group.members.length > 0 && (
          <section key={group.groupKey}>
            <h2 className="mb-8 text-center font-display text-2xl font-bold md:text-3xl">
              {t(`team.police.groups.${group.groupKey}`)}
            </h2>
            <TeamGrid members={group.members} emptyMessage={emptyMessage} />
          </section>
        )
      ))}
    </div>
  )
}
