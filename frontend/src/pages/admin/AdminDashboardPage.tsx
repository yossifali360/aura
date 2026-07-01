import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Ambulance,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Shield,
  UserCog,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { ApplicationsTable } from '@/components/admin/ApplicationsTable'
import { ApplicationDetailModal } from '@/components/admin/ApplicationDetailModal'
import { RulesEditor } from '@/components/admin/RulesEditor'
import { PoliceRosterEditor } from '@/components/admin/PoliceRosterEditor'
import { SendDiscordMessageModal } from '@/components/admin/SendDiscordMessageModal'
import { useAuthStore, isAuthPending } from '@/store/authStore'
import { useAuthHydrated } from '@/hooks/useAuthHydrated'
import { useApplicationSettingsStore } from '@/store/applicationSettingsStore'
import { useRulesStore } from '@/store/rulesStore'
import {
  fetchAdminApplications,
  fetchAdminApplicationTypes,
  fetchAdminContacts,
  fetchAdminRules,
  fetchAdminStats,
  fetchAdminUsers,
  updateAdminApplicationTypes,
  updateApplicationStatus,
  deleteApplication,
  updateUserRole,
  sendAdminApplicationMessage,
} from '@/api/admin'
import type {
  AdminRole,
  AdminStats,
  AllRulesContent,
  Application,
  ApplicationType,
  ApplicationTypeSettings,
  ContactMessage,
  User,
} from '@/types'
import {
  assignableAdminRoles,
  canManageAnyApplicationTypes,
  canManageApplicationType,
  canManagePoliceRoster,
  canManageRules,
  canManageRulesForType,
  canManageSettings,
  canManageUsers,
  canViewContacts,
  canViewEmsTab,
  canViewPoliceTab,
  canViewWhitelistTab,
  getDefaultAdminTab,
} from '@/utils/adminPermissions'

type Tab = 'whitelist' | 'police' | 'ems' | 'roster' | 'contacts' | 'users' | 'settings' | 'rules'

const TAB_TYPES: Record<'whitelist' | 'police' | 'ems', ApplicationType> = {
  whitelist: 'server',
  police: 'police',
  ems: 'ems',
}

const TYPE_SETTING_KEY: Record<'whitelist' | 'police' | 'ems', keyof ApplicationTypeSettings> = {
  whitelist: 'server',
  police: 'police',
  ems: 'ems',
}

export function AdminDashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, token, isLoading } = useAuthStore()
  const hydrated = useAuthHydrated()
  const authPending = isAuthPending({ hasHydrated: hydrated, token, user, isLoading })
  const didInitRef = useRef(false)
  const refreshPublicSettings = useApplicationSettingsStore((s) => s.refresh)
  const [tab, setTab] = useState<Tab>('whitelist')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [typeSettings, setTypeSettings] = useState<ApplicationTypeSettings | null>(null)
  const [typeSettingsLoading, setTypeSettingsLoading] = useState(false)
  const [typeSettingsError, setTypeSettingsError] = useState(false)
  const [rules, setRules] = useState<AllRulesContent | null>(null)
  const [rulesLoading, setRulesLoading] = useState(false)
  const [rulesError, setRulesError] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [tabLoading, setTabLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [messageTargetIds, setMessageTargetIds] = useState<number[]>([])
  const [messaging, setMessaging] = useState(false)
  const [messageFeedback, setMessageFeedback] = useState('')
  const [messageFeedbackIsError, setMessageFeedbackIsError] = useState(false)
  const [detailApplication, setDetailApplication] = useState<Application | null>(null)

  const isApplicationTab = tab === 'whitelist' || tab === 'police' || tab === 'ems'
  const applicationType = isApplicationTab ? TAB_TYPES[tab] : undefined

  const loadApplications = useCallback(async (type?: ApplicationType, status?: string) => {
    const { items } = await fetchAdminApplications({
      type,
      status: status || undefined,
    })
    setApplications(items)
  }, [])

  const loadRulesData = useCallback(async () => {
    if (!canManageRules(user)) return

    setRulesLoading(true)
    setRulesError(false)
    try {
      const data = await fetchAdminRules()
      setRules(data)
    } catch {
      const fallback = useRulesStore.getState().rules
      if (fallback) {
        setRules(fallback)
      } else {
        setRulesError(true)
      }
    } finally {
      setRulesLoading(false)
    }
  }, [user])

  const loadApplicationTypesData = useCallback(async () => {
    if (!canManageAnyApplicationTypes(user)) return

    setTypeSettingsLoading(true)
    setTypeSettingsError(false)
    try {
      const data = await fetchAdminApplicationTypes()
      setTypeSettings(data)
    } catch {
      const fallback = useApplicationSettingsStore.getState().settings
      if (fallback) {
        setTypeSettings(fallback)
      } else {
        setTypeSettingsError(true)
      }
    } finally {
      setTypeSettingsLoading(false)
    }
  }, [user])

  const loadCoreData = useCallback(async () => {
    const statsData = await fetchAdminStats()
    setStats(statsData)

    const tasks: Promise<void>[] = []

    if (canManageUsers(user)) {
      tasks.push(fetchAdminUsers().then((data) => setUsers(data)).catch(() => undefined))
    }
    if (canManageAnyApplicationTypes(user)) {
      tasks.push(loadApplicationTypesData().catch(() => undefined))
    }
    if (canManageRules(user)) {
      tasks.push(loadRulesData().catch(() => undefined))
    }
    if (canViewContacts(user)) {
      tasks.push(fetchAdminContacts().then((data) => setContacts(data.items)).catch(() => undefined))
    }

    await Promise.allSettled(tasks)
  }, [user, loadRulesData, loadApplicationTypesData])

  useEffect(() => {
    if (!user?.is_admin || !canManageAnyApplicationTypes(user) || typeSettings) return
    const cached = useApplicationSettingsStore.getState().settings
    if (cached) {
      setTypeSettings(cached)
    }
  }, [user, typeSettings])

  useEffect(() => {
    if (authPending) return

    if (!user?.is_admin) {
      navigate('/', { replace: true })
      return
    }

    if (didInitRef.current) return
    didInitRef.current = true

    const defaultTab = getDefaultAdminTab(user)
    setTab(defaultTab)
    setLoading(true)
    loadCoreData()
      .then(() => {
        if (defaultTab === 'whitelist' || defaultTab === 'police' || defaultTab === 'ems') {
          return loadApplications(TAB_TYPES[defaultTab])
        }
      })
      .finally(() => setLoading(false))
  }, [authPending, user, navigate, loadCoreData, loadApplications])

  useEffect(() => {
    if (!user?.is_admin || loading || !isApplicationTab || !applicationType) return
    if (!canManageApplicationType(user, applicationType)) return
    if (typeSettings || typeSettingsLoading) return
    void loadApplicationTypesData()
  }, [user, loading, isApplicationTab, applicationType, typeSettings, typeSettingsLoading, loadApplicationTypesData])

  useEffect(() => {
    if (!user?.is_admin || loading || tab !== 'rules' || !canManageRules(user) || rules || rulesLoading) return
    void loadRulesData()
  }, [user, loading, tab, rules, rulesLoading, loadRulesData])

  useEffect(() => {
    if (!user?.is_admin || loading || !isApplicationTab) return

    setTabLoading(true)
    loadApplications(applicationType, filterStatus)
      .finally(() => setTabLoading(false))
  }, [user, loading, tab, filterStatus, isApplicationTab, applicationType, loadApplications])

  useEffect(() => {
    if (tab !== 'police') setDetailApplication(null)
  }, [tab])

  useEffect(() => {
    setSelectedIds([])
    setMessageFeedback('')
    setMessageFeedbackIsError(false)
  }, [tab, filterStatus])

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === applications.length ? [] : applications.map((a) => a.id)))
  }

  const openMessageModal = (ids: number[]) => {
    setMessageTargetIds(ids)
    setMessageModalOpen(true)
  }

  const handleSendMessage = async (message: string) => {
    setMessaging(true)
    setMessageFeedback('')
    setMessageFeedbackIsError(false)
    try {
      const result = await sendAdminApplicationMessage(messageTargetIds, message)
      const failureDetail = result.failures ? Object.values(result.failures)[0] : undefined
      const summary = t('admin.discord.result', { sent: result.sent, failed: result.failed })
      setMessageFeedback(failureDetail && result.failed > 0 ? `${summary} ${failureDetail}` : summary)
      setMessageFeedbackIsError(result.failed > 0)
      if (result.sent > 0) {
        setMessageModalOpen(false)
        setMessageTargetIds([])
        setSelectedIds([])
      }
    } catch {
      setMessageFeedback(t('common.error'))
      setMessageFeedbackIsError(true)
    } finally {
      setMessaging(false)
    }
  }

  const handleStatus = async (id: number, status: Application['status']) => {
    setUpdatingId(id)
    try {
      const updated = await updateApplicationStatus(id, status)
      setDetailApplication((prev) => (prev?.id === id ? updated : prev))
      if (applicationType) {
        await loadApplications(applicationType, filterStatus)
      }
      const statsData = await fetchAdminStats()
      setStats(statsData)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('admin.applications.delete_confirm'))) return

    setDeletingId(id)
    try {
      await deleteApplication(id)
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      if (applicationType) {
        await loadApplications(applicationType, filterStatus)
      }
      const statsData = await fetchAdminStats()
      setStats(statsData)
    } finally {
      setDeletingId(null)
    }
  }

  const handleUpdateUserRole = async (target: User, adminRole: AdminRole | null) => {
    setUpdatingUserId(target.id)
    try {
      const updated = await updateUserRole(target.id, adminRole)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleToggleType = async (key: keyof ApplicationTypeSettings) => {
    if (!typeSettings) return

    const next = { ...typeSettings, [key]: !typeSettings[key] }
    setSavingSettings(true)
    try {
      const updated = await updateAdminApplicationTypes(next)
      setTypeSettings(updated)
      await refreshPublicSettings()
    } finally {
      setSavingSettings(false)
    }
  }

  if (authPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="size-8 animate-spin rounded-full border-2 border-aura-500 border-t-transparent" />
      </div>
    )
  }

  if (!user?.is_admin) return null

  const typeLabel = (type: ApplicationType) => t(`admin.types.${type}`)

  const renderApplicationTab = (tabKey: 'whitelist' | 'police' | 'ems') => {
    const settingKey = TYPE_SETTING_KEY[tabKey]
    const isOpen = typeSettings?.[settingKey]
    const showSettings = canManageApplicationType(user, TAB_TYPES[tabKey])

    return (
      <div className="space-y-4">
        {showSettings && (
          <Card className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold">{t('admin.settings.applications_title')}</h3>
              <p className="text-sm text-slate-500">{t(`admin.settings.${settingKey}_desc`)}</p>
            </div>
            <div className="flex items-center gap-3">
              {typeSettingsLoading ? (
                <span className="size-5 animate-spin rounded-full border-2 border-aura-500 border-t-transparent" />
              ) : (
                <>
                  <Badge variant={isOpen ? 'success' : 'danger'}>
                    {isOpen ? t('admin.settings.open') : t('admin.settings.closed')}
                  </Badge>
                  <Button
                    size="sm"
                    variant={isOpen ? 'secondary' : 'primary'}
                    disabled={savingSettings || !typeSettings}
                    isLoading={savingSettings}
                    onClick={() => handleToggleType(settingKey)}
                  >
                    {isOpen ? t('admin.settings.disable') : t('admin.settings.enable')}
                  </Button>
                  {typeSettingsError && !typeSettings && (
                    <Button size="sm" variant="secondary" onClick={() => void loadApplicationTypesData()}>
                      {t('common.retry', 'Try again')}
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
        )}

        {messageFeedback && (
          <p className={`text-sm ${messageFeedbackIsError ? 'text-red-500' : 'text-emerald-500'}`}>{messageFeedback}</p>
        )}

        {tabLoading ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <span className="size-8 animate-spin rounded-full border-2 border-aura-500 border-t-transparent" />
          </div>
        ) : (
          <ApplicationsTable
            applications={applications}
            updatingId={updatingId}
            selectedIds={selectedIds}
            messaging={messaging}
            onStatus={handleStatus}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onSendToOne={(id) => openMessageModal([id])}
            onSendToSelected={() => openMessageModal(selectedIds)}
            onDelete={handleDelete}
            deletingId={deletingId}
            emptyMessage={t('admin.empty')}
            onPreview={tabKey === 'police' ? setDetailApplication : undefined}
            toolbar={
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-auto min-w-[12rem]"
              >
                <option value="">{t('admin.filters.all_statuses')}</option>
                <option value="pending">{t('apply.status_pending')}</option>
                <option value="approved">{t('apply.status_approved')}</option>
                <option value="rejected">{t('apply.status_rejected')}</option>
              </Select>
            }
          />
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-aura-600 text-white">
            <LayoutDashboard className="size-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{t('admin.title')}</h1>
            <p className="text-sm text-slate-500">{t('admin.subtitle')}</p>
          </div>
        </div>
      </div>

      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-sm text-slate-500">{t('admin.stats.pending')}</p>
            <p className="font-display text-2xl font-bold">{stats.applications_by_status.pending ?? 0}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">{t('admin.stats.approved')}</p>
            <p className="font-display text-2xl font-bold text-emerald-500">{stats.applications_by_status.approved ?? 0}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">{t('admin.stats.rejected')}</p>
            <p className="font-display text-2xl font-bold text-red-500">{stats.applications_by_status.rejected ?? 0}</p>
          </Card>
          {canViewContacts(user) && (
            <Card>
              <p className="text-sm text-slate-500">{t('admin.stats.contacts')}</p>
              <p className="font-display text-2xl font-bold">{stats.contact_messages}</p>
            </Card>
          )}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {canViewWhitelistTab(user) && (
          <Button variant={tab === 'whitelist' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('whitelist')}>
            <Users className="size-4" />
            {t('admin.tabs.whitelist')}
          </Button>
        )}
        {canViewPoliceTab(user) && (
          <Button variant={tab === 'police' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('police')}>
            <Shield className="size-4" />
            {t('admin.tabs.police')}
          </Button>
        )}
        {canViewEmsTab(user) && (
          <Button variant={tab === 'ems' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('ems')}>
            <Ambulance className="size-4" />
            {t('admin.tabs.ems')}
          </Button>
        )}
        {canManagePoliceRoster(user) && (
          <Button variant={tab === 'roster' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('roster')}>
            <ClipboardList className="size-4" />
            {t('admin.tabs.roster')}
          </Button>
        )}
        {canManageRules(user) && (
          <Button variant={tab === 'rules' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('rules')}>
            <BookOpen className="size-4" />
            {t('admin.tabs.rules')}
          </Button>
        )}
        {/* {canViewContacts(user) && (
          <Button variant={tab === 'contacts' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('contacts')}>
            <Mail className="size-4" />
            {t('admin.tabs.contacts')}
          </Button>
        )} */}
        {canManageUsers(user) && (
          <Button variant={tab === 'users' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('users')}>
            <UserCog className="size-4" />
            {t('admin.tabs.users')}
          </Button>
        )}
        {canManageSettings(user) && (
          <Button variant={tab === 'settings' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('settings')}>
            <Settings className="size-4" />
            {t('admin.tabs.settings')}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <span className="size-8 animate-spin rounded-full border-2 border-aura-500 border-t-transparent" />
        </div>
      ) : tab === 'whitelist' && canViewWhitelistTab(user) ? (
        renderApplicationTab('whitelist')
      ) : tab === 'police' && canViewPoliceTab(user) ? (
        renderApplicationTab('police')
      ) : tab === 'ems' && canViewEmsTab(user) ? (
        renderApplicationTab('ems')
      ) : tab === 'roster' && canManagePoliceRoster(user) ? (
        <PoliceRosterEditor />
      ) : tab === 'rules' && canManageRules(user) ? (
        rulesLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <span className="size-8 animate-spin rounded-full border-2 border-aura-500 border-t-transparent" />
          </div>
        ) : rules ? (
          <RulesEditor
            initialRules={rules}
            onSaved={setRules}
            editableTypes={(['server', 'police', 'ems'] as const).filter((type) => canManageRulesForType(user, type))}
          />
        ) : (
          <Card className="space-y-4 text-center">
            <p className="text-slate-500">{rulesError ? t('common.error') : t('admin.rules.empty_preview')}</p>
            <Button size="sm" onClick={() => void loadRulesData()}>
              {t('common.retry', 'Try again')}
            </Button>
          </Card>
        )
      ) : tab === 'contacts' && canViewContacts(user) ? (
        <div className="space-y-4">
          {contacts.map((msg) => (
            <Card key={msg.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{msg.subject}</p>
                  <p className="text-sm text-slate-500">{msg.name} · {msg.email}</p>
                </div>
                <p className="text-xs text-slate-400">{new Date(msg.created_at).toLocaleString()}</p>
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{msg.message}</p>
            </Card>
          ))}
          {contacts.length === 0 && (
            <Card className="text-center text-slate-500">{t('admin.empty_contacts')}</Card>
          )}
        </div>
      ) : tab === 'users' && canManageUsers(user) ? (
        <Card glow className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">{t('admin.table.user')}</th>
                  <th className="px-4 py-3 font-medium">{t('admin.users.discord_id')}</th>
                  <th className="px-4 py-3 font-medium">{t('admin.users.role')}</th>
                  <th className="px-4 py-3 font-medium">{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">{u.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={u.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.first_name)}&background=dc2626&color=fff`}
                          alt=""
                          className="size-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{u.first_name}</p>
                          <p className="text-xs text-slate-500">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.discord_id}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.admin_role ? 'success' : 'warning'}>
                        {u.admin_role ? t(`admin.roles.${u.admin_role}`) : t('admin.users.member')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {u.id === user.id ? (
                        <span className="text-sm text-slate-500">{t('admin.users.you')}</span>
                      ) : (
                        <Select
                          size="sm"
                          value={u.admin_role ?? ''}
                          disabled={updatingUserId === u.id}
                          className="min-w-[10rem]"
                          onChange={(e) => {
                            const value = e.target.value
                            handleUpdateUserRole(u, value === '' ? null : (value as AdminRole))
                          }}
                        >
                          <option value="">{t('admin.users.member')}</option>
                          {assignableAdminRoles(user).map((role) => (
                            <option key={role} value={role}>
                              {t(`admin.roles.${role}`)}
                            </option>
                          ))}
                        </Select>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      {t('admin.users.empty')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : tab === 'settings' && canManageSettings(user) ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(['server', 'police', 'ems'] as const).map((key) => (
            <Card key={key} glow className="flex h-full flex-col">
              <div className="flex flex-1 items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold">{typeLabel(key)}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t(`admin.settings.${key}_desc`)}</p>
                </div>
                <Badge className="shrink-0" variant={typeSettings?.[key] ? 'success' : 'danger'}>
                  {typeSettings?.[key] ? t('admin.settings.open') : t('admin.settings.closed')}
                </Badge>
              </div>
              <Button
                className="mt-4 w-full shrink-0"
                variant={typeSettings?.[key] ? 'secondary' : 'primary'}
                disabled={savingSettings || !typeSettings}
                isLoading={savingSettings}
                onClick={() => handleToggleType(key)}
              >
                {typeSettings?.[key] ? t('admin.settings.disable') : t('admin.settings.enable')}
              </Button>
            </Card>
          ))}
        </div>
      ) : null}

      <SendDiscordMessageModal
        open={messageModalOpen}
        recipientCount={messageTargetIds.length}
        isLoading={messaging}
        onClose={() => {
          if (!messaging) {
            setMessageModalOpen(false)
            setMessageTargetIds([])
          }
        }}
        onSend={handleSendMessage}
      />

      {tab === 'police' && (
        <ApplicationDetailModal
          open={detailApplication !== null}
          application={detailApplication}
          applicationType="police"
          updatingId={updatingId}
          onClose={() => setDetailApplication(null)}
          onStatus={handleStatus}
        />
      )}
    </div>
  )
}
