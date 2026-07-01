export type PoliceMemberSection =
  | 'ministry_leadership'
  | 'executive_leadership'
  | 'officers'
  | 'secretaries'
  | 'sergeants'
  | 'corporals'
  | 'soldiers'
  | 'academy'

export type PoliceMemberStatus = 'active' | 'inactive' | 'suspended' | 'leave'

export type PoliceSpecialtyStatus = 'none' | 'certified' | 'training'

export type PoliceRank =
  | 'interior_minister'
  | 'deputy_interior_minister'
  | 'first_assistant_interior_minister'
  | 'general'
  | 'brigadier'
  | 'colonel'
  | 'lieutenant_colonel'
  | 'major'
  | 'captain'
  | 'first_lieutenant'
  | 'lieutenant'
  | 'police_secretary'
  | 'first_sergeant'
  | 'sergeant'
  | 'first_corporal'
  | 'corporal'
  | 'first_soldier'
  | 'soldier'
  | 'trainee'

export type PoliceSpecialtyField =
  | 'specialty_speed'
  | 'specialty_motor'
  | 'specialty_air'
  | 'specialty_offroad'
  | 'specialty_operations'
  | 'specialty_negotiation'
  | 'specialty_national_security'

export interface PoliceMember {
  id: number
  badge_number: string
  name: string
  shoulder_rank: string | null
  rank: PoliceRank
  section: PoliceMemberSection
  status: PoliceMemberStatus
  position: string | null
  discord_username: string | null
  discord_id: string | null
  points_exempt: boolean
  points: number | null
  warnings: number
  last_promotion_date: string | null
  joined_at: string | null
  specialty_speed: PoliceSpecialtyStatus
  specialty_motor: PoliceSpecialtyStatus
  specialty_air: PoliceSpecialtyStatus
  specialty_offroad: PoliceSpecialtyStatus
  specialty_operations: PoliceSpecialtyStatus
  specialty_negotiation: PoliceSpecialtyStatus
  specialty_national_security: PoliceSpecialtyStatus
}

export type PoliceRosterGrouped = Record<PoliceMemberSection, PoliceMember[]>

export interface PoliceMemberFormData {
  badge_number: string
  name: string
  shoulder_rank: string
  rank: PoliceRank
  section: PoliceMemberSection
  status: PoliceMemberStatus
  position: string
  discord_username: string
  discord_id: string
  points_exempt: boolean
  points: string
  warnings: string
  last_promotion_date: string
  joined_at: string
  specialty_speed: PoliceSpecialtyStatus
  specialty_motor: PoliceSpecialtyStatus
  specialty_air: PoliceSpecialtyStatus
  specialty_offroad: PoliceSpecialtyStatus
  specialty_operations: PoliceSpecialtyStatus
  specialty_negotiation: PoliceSpecialtyStatus
  specialty_national_security: PoliceSpecialtyStatus
}

export interface PoliceOptions {
  sections: PoliceMemberSection[]
  statuses: PoliceMemberStatus[]
  ranks: PoliceRank[]
  specialty_statuses: PoliceSpecialtyStatus[]
  specialty_fields: PoliceSpecialtyField[]
}

export const POLICE_SECTION_ORDER: PoliceMemberSection[] = [
  'ministry_leadership',
  'executive_leadership',
  'officers',
  'secretaries',
  'sergeants',
  'corporals',
  'soldiers',
  'academy',
]
export const POLICE_SPECIALTY_FIELDS: PoliceSpecialtyField[] = [
  'specialty_speed',
  'specialty_motor',
  'specialty_air',
  'specialty_offroad',
  'specialty_operations',
  'specialty_negotiation',
  'specialty_national_security',
]

export const EMPTY_POLICE_MEMBER_FORM: PoliceMemberFormData = {
  badge_number: '',
  name: '',
  shoulder_rank: '',
  rank: 'soldier',
  section: 'soldiers',
  status: 'active',
  position: '',
  discord_username: '',
  discord_id: '',
  points_exempt: false,
  points: '',
  warnings: '0',
  last_promotion_date: '',
  joined_at: '',
  specialty_speed: 'none',
  specialty_motor: 'none',
  specialty_air: 'none',
  specialty_offroad: 'none',
  specialty_operations: 'none',
  specialty_negotiation: 'none',
  specialty_national_security: 'none',
}

export function policeMemberToForm(member: PoliceMember): PoliceMemberFormData {
  return {
    badge_number: member.badge_number,
    name: member.name,
    shoulder_rank: member.shoulder_rank ?? '',
    rank: member.rank,
    section: member.section,
    status: member.status,
    position: member.position ?? '',
    discord_username: member.discord_username ?? '',
    discord_id: member.discord_id ?? '',
    points_exempt: member.points_exempt,
    points: member.points?.toString() ?? '',
    warnings: member.warnings.toString(),
    last_promotion_date: member.last_promotion_date ?? '',
    joined_at: member.joined_at ?? '',
    specialty_speed: member.specialty_speed,
    specialty_motor: member.specialty_motor,
    specialty_air: member.specialty_air,
    specialty_offroad: member.specialty_offroad,
    specialty_operations: member.specialty_operations,
    specialty_negotiation: member.specialty_negotiation,
    specialty_national_security: member.specialty_national_security,
  }
}

export function formToPolicePayload(form: PoliceMemberFormData) {
  return {
    badge_number: form.badge_number.trim(),
    name: form.name.trim(),
    shoulder_rank: form.shoulder_rank.trim() || null,
    rank: form.rank,
    section: form.section,
    status: form.status,
    position: form.position.trim() || null,
    discord_username: form.discord_username.trim() || null,
    discord_id: form.discord_id.trim() || null,
    points_exempt: form.points_exempt,
    points: form.points_exempt || form.points.trim() === '' ? null : Number(form.points),
    warnings: Number(form.warnings) || 0,
    last_promotion_date: form.last_promotion_date || null,
    joined_at: form.joined_at || null,
    specialty_speed: form.specialty_speed,
    specialty_motor: form.specialty_motor,
    specialty_air: form.specialty_air,
    specialty_offroad: form.specialty_offroad,
    specialty_operations: form.specialty_operations,
    specialty_negotiation: form.specialty_negotiation,
    specialty_national_security: form.specialty_national_security,
  }
}
