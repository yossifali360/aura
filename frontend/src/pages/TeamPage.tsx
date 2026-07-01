import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Ambulance, ArrowLeft, Shield, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TeamGrid } from '@/components/team/TeamGrid'
import { PoliceTeamGroups } from '@/components/team/PoliceTeamGroups'
import { fetchPublicPoliceRoster } from '@/api/police'
import { getPoliceTeamGroups, getTeamMembers, type TeamSection } from '@/data/team'
import { rosterGroupedToDisplayGroups } from '@/utils/policeRoster'
import type { PoliceDisplayGroup } from '@/utils/policeRoster'

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
  const [policeGroups, setPoliceGroups] = useState<PoliceDisplayGroup[]>([])
  const [policeLoading, setPoliceLoading] = useState(section === 'police')
  const [policeError, setPoliceError] = useState(false)

  const staticPoliceGroups = useMemo(
    () => (section === 'police' ? getPoliceTeamGroups() : []),
    [section],
  )

  useEffect(() => {
    if (section !== 'police') return

    let active = true
    setPoliceLoading(true)
    setPoliceError(false)

    fetchPublicPoliceRoster()
      .then((roster) => {
        if (!active) return
        const groups = rosterGroupedToDisplayGroups(roster)
        const hasMembers = groups.some((group) => group.members.length > 0)
        setPoliceGroups(hasMembers ? groups : staticPoliceGroups)
      })
      .catch(() => {
        if (active) {
          setPoliceError(true)
          setPoliceGroups(staticPoliceGroups)
        }
      })
      .finally(() => {
        if (active) setPoliceLoading(false)
      })

    return () => {
      active = false
    }
  }, [section, staticPoliceGroups])

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
        policeLoading ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <span className="size-8 animate-spin rounded-full border-2 border-aura-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {policeError && (
              <p className="mb-6 text-center text-sm text-amber-600 dark:text-amber-400">
                {t('police.roster.load_fallback')}
              </p>
            )}
            <PoliceTeamGroups groups={policeGroups} emptyMessage={t('team.empty')} />
          </>
        )
      ) : (
        <TeamGrid
          members={members}
          emptyMessage={t('team.empty')}
        />
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
