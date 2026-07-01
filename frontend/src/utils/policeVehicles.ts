import type { PoliceMember, PoliceRank } from '@/types/police'

/** Highest rank first — lower index means higher seniority. */
export const POLICE_RANK_ORDER: PoliceRank[] = [
  'interior_minister',
  'deputy_interior_minister',
  'first_assistant_interior_minister',
  'general',
  'brigadier',
  'colonel',
  'lieutenant_colonel',
  'major',
  'captain',
  'first_lieutenant',
  'lieutenant',
  'police_secretary',
  'first_sergeant',
  'sergeant',
  'first_corporal',
  'corporal',
  'first_soldier',
  'soldier',
  'trainee',
]

export type PoliceVehicleId =
  | 'ford_victoria'
  | 'ford_explorer'
  | 'chevrolet_silverado'
  | 'dodge_charger'
  | 'dodge_durango'
  | 'dodge_challenger'
  | 'bmw_m5'
  | 'chevrolet_camaro'
  | 'porsche_gt3'
  | 'bmw_m3'

type VehicleEligibility =
  | { type: 'min_rank'; rank: PoliceRank }
  | { type: 'exact_rank'; rank: PoliceRank }
  | { type: 'investigation_head' }

export const POLICE_INVESTIGATION_HEAD_POSITIONS = [
  'رئيس وحدة المباحث',
  'نائب رئيس وحدة المباحث',
] as const

export const POLICE_VEHICLES: { id: PoliceVehicleId; eligibility: VehicleEligibility }[] = [
  { id: 'ford_victoria', eligibility: { type: 'min_rank', rank: 'first_soldier' } },
  { id: 'ford_explorer', eligibility: { type: 'min_rank', rank: 'first_corporal' } },
  { id: 'chevrolet_silverado', eligibility: { type: 'min_rank', rank: 'sergeant' } },
  { id: 'dodge_charger', eligibility: { type: 'min_rank', rank: 'lieutenant' } },
  { id: 'dodge_durango', eligibility: { type: 'min_rank', rank: 'captain' } },
  { id: 'dodge_challenger', eligibility: { type: 'investigation_head' } },
  { id: 'bmw_m5', eligibility: { type: 'min_rank', rank: 'lieutenant_colonel' } },
  { id: 'chevrolet_camaro', eligibility: { type: 'min_rank', rank: 'major' } },
  { id: 'porsche_gt3', eligibility: { type: 'exact_rank', rank: 'interior_minister' } },
  { id: 'bmw_m3', eligibility: { type: 'exact_rank', rank: 'deputy_interior_minister' } },
]

function getRankIndex(rank: PoliceRank): number {
  return POLICE_RANK_ORDER.indexOf(rank)
}

export function isRankAtLeast(rank: PoliceRank, minRank: PoliceRank): boolean {
  const rankIndex = getRankIndex(rank)
  const minIndex = getRankIndex(minRank)
  if (rankIndex === -1 || minIndex === -1) return false
  return rankIndex <= minIndex
}

export function isInvestigationUnitHead(position: string | null): boolean {
  if (!position) return false
  const normalized = position.trim()
  return POLICE_INVESTIGATION_HEAD_POSITIONS.some((title) => title === normalized)
}

export function isEligibleForPoliceVehicle(member: PoliceMember, vehicleId: PoliceVehicleId): boolean {
  const vehicle = POLICE_VEHICLES.find((item) => item.id === vehicleId)
  if (!vehicle) return false

  switch (vehicle.eligibility.type) {
    case 'min_rank':
      return isRankAtLeast(member.rank, vehicle.eligibility.rank)
    case 'exact_rank':
      return member.rank === vehicle.eligibility.rank
    case 'investigation_head':
      return isInvestigationUnitHead(member.position)
    default:
      return false
  }
}

export function getAvailablePoliceVehicles(member: PoliceMember): PoliceVehicleId[] {
  return POLICE_VEHICLES.filter((vehicle) => isEligibleForPoliceVehicle(member, vehicle.id)).map(
    (vehicle) => vehicle.id,
  )
}
