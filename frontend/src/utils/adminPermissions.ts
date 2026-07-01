import type { AdminRole, ApplicationType, User } from '@/types'

export function getEffectiveAdminRole(user: User | null | undefined): AdminRole | null {
  if (!user?.is_admin) return null
  return user.admin_role ?? 'super_admin'
}

export function canViewWhitelistTab(user: User | null | undefined): boolean {
  const role = getEffectiveAdminRole(user)
  return role === 'super_admin' || role === 'whitelist_admin'
}

export function canViewPoliceTab(user: User | null | undefined): boolean {
  const role = getEffectiveAdminRole(user)
  return role === 'super_admin' || role === 'police_admin'
}

export function canViewEmsTab(user: User | null | undefined): boolean {
  const role = getEffectiveAdminRole(user)
  return role === 'super_admin' || role === 'ems_admin'
}

export function canManageRules(user: User | null | undefined): boolean {
  const role = getEffectiveAdminRole(user)
  return role === 'super_admin' || role === 'police_admin' || role === 'ems_admin'
}

export function canManageRulesForType(user: User | null | undefined, type: ApplicationType): boolean {
  const role = getEffectiveAdminRole(user)
  if (role === 'super_admin') return true
  if (role === 'police_admin' && type === 'police') return true
  if (role === 'ems_admin' && type === 'ems') return true
  return false
}

export function canManageApplicationType(user: User | null | undefined, type: ApplicationType): boolean {
  const role = getEffectiveAdminRole(user)
  if (role === 'super_admin') return true
  if (role === 'whitelist_admin' && type === 'server') return true
  if (role === 'police_admin' && type === 'police') return true
  if (role === 'ems_admin' && type === 'ems') return true
  return false
}

export function canManageAnyApplicationTypes(user: User | null | undefined): boolean {
  const role = getEffectiveAdminRole(user)
  return (
    role === 'super_admin' ||
    role === 'whitelist_admin' ||
    role === 'police_admin' ||
    role === 'ems_admin'
  )
}

export function canViewContacts(user: User | null | undefined): boolean {
  return getEffectiveAdminRole(user) === 'super_admin'
}

export function canManageUsers(user: User | null | undefined): boolean {
  const role = getEffectiveAdminRole(user)
  return role === 'super_admin' || role === 'users_admin'
}

export function canManagePoliceRoster(user: User | null | undefined): boolean {
  const role = getEffectiveAdminRole(user)
  return role === 'super_admin' || role === 'police_admin'
}

export function canManageSettings(user: User | null | undefined): boolean {
  return getEffectiveAdminRole(user) === 'super_admin'
}

export function assignableAdminRoles(user: User | null | undefined): AdminRole[] {
  const role = getEffectiveAdminRole(user)
  if (role === 'super_admin') {
    return ['super_admin', 'whitelist_admin', 'police_admin', 'ems_admin', 'users_admin']
  }
  if (role === 'users_admin') {
    return ['whitelist_admin', 'police_admin', 'ems_admin']
  }
  return []
}

export function getDefaultAdminTab(user: User | null | undefined): 'whitelist' | 'police' | 'ems' | 'rules' | 'contacts' | 'users' | 'settings' {
  if (canViewWhitelistTab(user)) return 'whitelist'
  if (canViewPoliceTab(user)) return 'police'
  if (canViewEmsTab(user)) return 'ems'
  if (canManageUsers(user)) return 'users'
  if (canManageRules(user)) return 'rules'
  if (canManageSettings(user)) return 'settings'
  if (canViewContacts(user)) return 'contacts'
  return 'whitelist'
}
