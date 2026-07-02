import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Ambulance, ArrowLeft, Shield, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TeamGrid } from '@/components/team/TeamGrid'
import { PoliceTeamGroups } from '@/components/team/PoliceTeamGroups'
import { getPoliceTeamGroups, getTeamMembers, type TeamSection } from '@/data/team'

const sectionMeta: Record<TeamSection, { icon: typeof Users; teamPath: string }> = {
  admin: { icon: Users, teamPath: '/team' },
  police: { icon: Shield, teamPath: '/team/police' },
  ems: { icon: Ambulance, teamPath: '/team/ems' },
}

interface TeamPageProps {
  section: TeamSection
}

export function TeamPage({ section }: TeamPageProps) {
  const { t } = useTranslation()
  const members = getTeamMembers(section)
  const { icon: Icon } = sectionMeta[section]
  const policeGroups = useMemo(
    () => (section === 'police' ? getPoliceTeamGroups() : []),
    [section],
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-aura-500/15 text-aura-600 dark:text-aura-400">
          <Icon className="size-7" />
        </div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          {t(`team.${section}.title`)}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
          {t(`team.${section}.subtitle`)}
        </p>
      </div>

      {section === 'police' ? (
        <PoliceTeamGroups groups={policeGroups} emptyMessage={t('team.empty')} />
      ) : (
        <TeamGrid members={members} emptyMessage={t('team.empty')} />
      )}

      <div className="mt-12 text-center">
        <Link to="/">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="size-4" />
            {t('team.back_home')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
