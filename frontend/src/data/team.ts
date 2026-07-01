export type TeamSection = 'admin' | 'police' | 'ems'

export interface TeamMember {
  /** Discord user ID (Developer Mode → Copy User ID) */
  discordId: string
  /** Display name (character name for police & EMS) */
  name: string
  /** Translation key under `team.roles` */
  roleKey: string
  /** Optional full Discord avatar URL for the member's real profile picture */
  avatarUrl?: string
  /** Optional badge / roster number */
  badgeNumber?: string
}

export interface PoliceTeamGroup {
  groupKey: 'ministry_leadership' | 'executive_leadership' | 'officers' | 'secretaries'
  members: TeamMember[]
}

export const SERVER_ADMINS: TeamMember[] = [
  {
    discordId: '1153681674127806514',
    name: 'ABNMASR',
    roleKey: 'founder',
  },
  {
    discordId: '853325320286765076',
    name: 'EL DEEB',
    roleKey: 'dev_director',
  },
  {
    discordId: '845405845105541171',
    name: 'Ra1zoo',
    roleKey: 'high_management',
  },
]

export const POLICE_TEAM_GROUPS: PoliceTeamGroup[] = [
  {
    groupKey: 'ministry_leadership',
    members: [
      {
        badgeNumber: '101',
        discordId: '1372247046404440084',
        name: 'مازن محمد',
        roleKey: 'interior_minister',
      },
      {
        badgeNumber: '102',
        discordId: '822036947610370070',
        name: 'رامز محمد',
        roleKey: 'deputy_interior_minister',
      },
      {
        badgeNumber: '103',
        discordId: '710483755927863318',
        name: 'ماكس رولينز',
        roleKey: 'first_assistant_interior_minister',
      },
      {
        badgeNumber: '104',
        discordId: '853096774595772417',
        name: 'محمد مصطفى',
        roleKey: 'first_assistant_interior_minister',
      },
    ],
  },
  {
    groupKey: 'executive_leadership',
    members: [
      {
        badgeNumber: '201',
        discordId: '796038620930375750',
        name: 'ماكس ريدفيلد',
        roleKey: 'colonel',
      },
      {
        badgeNumber: '202',
        discordId: '1014825317782802434',
        name: 'حمد علوش',
        roleKey: 'lieutenant_colonel',
      },
      {
        badgeNumber: '203',
        discordId: '379061585794039808',
        name: 'محمد العجرودي',
        roleKey: 'lieutenant_colonel',
      },
      {
        badgeNumber: '204',
        discordId: '1079755748126507118',
        name: 'قاظم أباظة',
        roleKey: 'lieutenant_colonel',
      },
      {
        badgeNumber: '205',
        discordId: '1437950161761468519',
        name: 'كريم ويليم',
        roleKey: 'lieutenant_colonel',
      },
      {
        badgeNumber: '206',
        discordId: '669369786094059551',
        name: 'عبدالرحمن أحمد',
        roleKey: 'major',
      },
      {
        badgeNumber: '207',
        discordId: '578489617322475551',
        name: 'نيرة مجدي',
        roleKey: 'major',
      },
      {
        badgeNumber: '208',
        discordId: '1441155961015505028',
        name: 'أحمد الكاشف',
        roleKey: 'major',
      },
    ],
  },
  {
    groupKey: 'officers',
    members: [
      {
        badgeNumber: '301',
        discordId: '1475977767773278380',
        name: 'إدوارد ووكر',
        roleKey: 'lieutenant',
      },
      {
        badgeNumber: '302',
        discordId: '1444985572727849012',
        name: 'علي المصري',
        roleKey: 'lieutenant',
      },
    ],
  },
  {
    groupKey: 'secretaries',
    members: [
      {
        badgeNumber: '401',
        discordId: '1056217051351494686',
        name: 'شحاتة السيد',
        roleKey: 'police_secretary',
      },
      {
        badgeNumber: '402',
        discordId: '1438324695714762834',
        name: 'يوسف صقر',
        roleKey: 'police_secretary',
      },
      {
        badgeNumber: '403',
        discordId: '891804170024288287',
        name: 'سليم الرفاعي',
        roleKey: 'police_secretary',
      },
    ],
  },
]

export const POLICE_TEAM: TeamMember[] = POLICE_TEAM_GROUPS.flatMap((group) => group.members)

// export const EMS_TEAM: TeamMember[] = [
//   {
//     discordId: '000000000000000005',
//     name: 'Discord Name',
//     characterName: 'Alex Rivera',
//     roleKey: 'director',
//   },
// ]

export const EMS_TEAM: TeamMember[] = []

export function getPoliceTeamGroups(): PoliceTeamGroup[] {
  return POLICE_TEAM_GROUPS
}

export function getTeamMembers(section: TeamSection): TeamMember[] {
  switch (section) {
    case 'admin':
      return SERVER_ADMINS
    case 'police':
      return POLICE_TEAM
    case 'ems':
      return EMS_TEAM
  }
}
