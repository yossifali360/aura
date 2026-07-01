import type { TeamMember } from '@/data/team'
import type { PoliceMember, PoliceMemberSection, PoliceRosterGrouped } from '@/types/police'
import { POLICE_SECTION_ORDER } from '@/types/police'

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
