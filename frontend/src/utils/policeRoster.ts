import type { TeamMember } from '@/data/team'
import type {
  PoliceMember,
  PoliceMemberSection,
  PoliceRosterGrouped,
  PoliceSpecialtyField,
} from '@/types/police'
import { POLICE_SECTION_ORDER, POLICE_SPECIALTY_FIELDS } from '@/types/police'

export interface PoliceRosterFilters {
  search: string
  rank: string
  section: string
  status: string
  specialty_speed: string
  specialty_motor: string
  specialty_air: string
  specialty_offroad: string
  specialty_operations: string
  specialty_negotiation: string
  specialty_national_security: string
}

export const EMPTY_POLICE_ROSTER_FILTERS: PoliceRosterFilters = {
  search: '',
  rank: '',
  section: '',
  status: '',
  specialty_speed: '',
  specialty_motor: '',
  specialty_air: '',
  specialty_offroad: '',
  specialty_operations: '',
  specialty_negotiation: '',
  specialty_national_security: '',
}

export function filterPoliceRosterMembers(
  members: PoliceMember[],
  filters: PoliceRosterFilters,
): PoliceMember[] {
  const search = filters.search.trim().toLowerCase()

  return members.filter((member) => {
    if (search && !member.name.toLowerCase().includes(search)) {
      return false
    }

    if (filters.rank && member.rank !== filters.rank) {
      return false
    }

    if (filters.section && member.section !== filters.section) {
      return false
    }

    if (filters.status && member.status !== filters.status) {
      return false
    }

    for (const field of POLICE_SPECIALTY_FIELDS) {
      const value = filters[field as PoliceSpecialtyField]
      if (value && member[field] !== value) {
        return false
      }
    }

    return true
  })
}

export interface PoliceDisplayGroup {
  groupKey: PoliceMemberSection
  members: TeamMember[]
}

export function policeMemberToTeamMember(member: PoliceMember): TeamMember {
  return {
    discordId: member.discord_id ?? '',
    name: member.name,
    roleKey: member.rank,
    badgeNumber: member.badge_number,
  }
}

export function rosterGroupedToDisplayGroups(roster: PoliceRosterGrouped): PoliceDisplayGroup[] {
  return POLICE_SECTION_ORDER.map((groupKey) => ({
    groupKey,
    members: (roster[groupKey] ?? []).map(policeMemberToTeamMember),
  }))
}
