import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import {
  createPoliceMember,
  deletePoliceMember,
  fetchAdminPoliceMembers,
  fetchLinkablePoliceUsers,
  fetchPoliceOptions,
  updatePoliceMember,
} from '@/api/police'
import {
  EMPTY_POLICE_MEMBER_FORM,
  POLICE_SPECIALTY_FIELDS,
  POLICE_SECTION_LABELS_AR,
  POLICE_SECTION_ORDER,
  policeMemberToForm,
  type PoliceLinkableUser,
  type PoliceMember,
  type PoliceMemberFormData,
  type PoliceOptions,
  type PoliceSpecialtyField,
} from '@/types/police'
import {
  EMPTY_POLICE_ROSTER_FILTERS,
  filterPoliceRosterMembers,
  type PoliceRosterFilters,
} from '@/utils/policeRoster'
import { getAvailablePoliceVehicles } from '@/utils/policeVehicles'

function formatMemberDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-end font-medium">{value}</dd>
    </div>
  )
}

interface PoliceMemberViewModalProps {
  member: PoliceMember | null
  onClose: () => void
  onEdit: (member: PoliceMember) => void
}

function PoliceMemberViewModal({ member, onClose, onEdit }: PoliceMemberViewModalProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!member) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [member, onClose])

  if (!member) return null

  const pointsLabel = member.points_exempt
    ? t('police.profile.exempt')
    : member.points?.toString() ?? '0'
  const availableVehicles = getAvailablePoliceVehicles(member)

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label={t('admin.discord.cancel')}
        onClick={onClose}
      />

      <Card glow className="relative z-10 flex max-h-[min(90dvh,56rem)] w-full max-w-3xl flex-col overflow-hidden p-0">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200/70 px-6 py-4 dark:border-slate-700/70">
          <div>
            <h3 className="font-display text-xl font-bold">{t('admin.roster.view_title')}</h3>
            <p className="mt-0.5 text-sm text-slate-500">{member.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label={t('admin.discord.cancel')}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
          <section>
            <h4 className="mb-3 font-display text-base font-bold">{t('police.profile.details')}</h4>
            <dl className="space-y-3">
              <DetailRow label={t('admin.roster.badge_number')} value={member.badge_number} />
              <DetailRow label={t('admin.roster.name')} value={member.name} />
              <DetailRow
                label={t('admin.roster.rank')}
                value={t(`police.ranks.${member.rank}`, member.rank)}
              />
              <DetailRow
                label={t('admin.roster.section')}
                value={POLICE_SECTION_LABELS_AR[member.section]}
              />
              <DetailRow
                label={t('admin.roster.status')}
                value={
                  <Badge variant={member.status === 'active' ? 'success' : 'danger'}>
                    {t(`police.statuses.${member.status}`, member.status)}
                  </Badge>
                }
              />
              {member.position && (
                <DetailRow label={t('admin.roster.position')} value={member.position} />
              )}
              {member.discord_username && (
                <DetailRow label={t('admin.roster.discord_username')} value={member.discord_username} />
              )}
              {member.discord_id && (
                <DetailRow
                  label={t('admin.roster.discord_id')}
                  value={<span className="font-mono text-xs">{member.discord_id}</span>}
                />
              )}
            </dl>
          </section>

          <section>
            <h4 className="mb-3 font-display text-base font-bold">{t('police.profile.record')}</h4>
            <dl className="space-y-3">
              <DetailRow label={t('admin.roster.joined_at')} value={formatMemberDate(member.joined_at)} />
              <DetailRow
                label={t('admin.roster.last_promotion')}
                value={formatMemberDate(member.last_promotion_date)}
              />
              <DetailRow label={t('admin.roster.points')} value={pointsLabel} />
              <DetailRow
                label={t('admin.roster.warnings')}
                value={<span className="text-red-500">{member.warnings}</span>}
              />
            </dl>
          </section>

          <section>
            <h4 className="mb-3 font-display text-base font-bold">{t('admin.roster.specialties')}</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {POLICE_SPECIALTY_FIELDS.map((field) => {
                const status = member[field]
                const variant =
                  status === 'certified' ? 'success' : status === 'training' ? 'warning' : 'default'

                return (
                  <div
                    key={field}
                    className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-center dark:border-cyan-500/30 dark:bg-slate-900/40"
                  >
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t(`police.specialties.${field}`)}
                    </p>
                    <Badge variant={variant} className="mt-1">
                      {t(`police.specialty_statuses.${status}`, status)}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            <h4 className="mb-3 font-display text-base font-bold">{t('police.profile.vehicles_title')}</h4>
            {availableVehicles.length === 0 ? (
              <p className="text-sm text-slate-500">{t('police.profile.vehicles_empty')}</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {availableVehicles.map((vehicleId) => (
                  <div
                    key={vehicleId}
                    className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-sm dark:border-cyan-500/30 dark:bg-slate-900/40"
                  >
                    <p className="font-semibold">{t(`police.vehicles.${vehicleId}.name`)}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {t(`police.vehicles.${vehicleId}.requirement`)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200/70 px-6 py-4 dark:border-slate-700/70">
          <Button variant="secondary" onClick={onClose}>
            {t('admin.discord.cancel')}
          </Button>
          <Button
            onClick={() => {
              onClose()
              onEdit(member)
            }}
          >
            <Pencil className="size-4" />
            {t('admin.roster.edit_title')}
          </Button>
        </div>
      </Card>
    </div>,
    document.body,
  )
}

interface PoliceMemberFormModalProps {
  open: boolean
  editing: PoliceMember | null
  options: PoliceOptions | null
  saving: boolean
  onClose: () => void
  onSave: (form: PoliceMemberFormData) => Promise<void>
}

function PoliceMemberFormModal({
  open,
  editing,
  options,
  saving,
  onClose,
  onSave,
}: PoliceMemberFormModalProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState<PoliceMemberFormData>(EMPTY_POLICE_MEMBER_FORM)
  const [linkableUsers, setLinkableUsers] = useState<PoliceLinkableUser[]>([])
  const [linkableLoading, setLinkableLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')

  useEffect(() => {
    if (!open) return
    setForm(editing ? policeMemberToForm(editing) : EMPTY_POLICE_MEMBER_FORM)
    setSelectedUserId('')
  }, [open, editing])

  useEffect(() => {
    if (!open) return

    let active = true
    setLinkableLoading(true)

    fetchLinkablePoliceUsers(editing?.id)
      .then((users) => {
        if (!active) return
        setLinkableUsers(users)

        if (editing?.discord_id) {
          const matched = users.find((user) => user.discord_id === editing.discord_id)
          if (matched) setSelectedUserId(String(matched.id))
        }
      })
      .catch(() => {
        if (active) setLinkableUsers([])
      })
      .finally(() => {
        if (active) setLinkableLoading(false)
      })

    return () => {
      active = false
    }
  }, [open, editing?.id, editing?.discord_id])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose()
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, saving, onClose])

  if (!open) return null

  const setField = <K extends keyof PoliceMemberFormData>(key: K, value: PoliceMemberFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!form.badge_number.trim() || !form.name.trim() || !form.discord_id.trim()) return
    await onSave(form)
  }

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId)

    const user = linkableUsers.find((item) => String(item.id) === userId)
    setField('discord_id', user?.discord_id ?? '')
    setField('discord_username', user?.username ?? '')
  }

  const formatLinkableUserLabel = (user: PoliceLinkableUser) => {
    const roleLabel = t(`admin.roster.police_roles.${user.police_role}`)
    return `${user.first_name} (@${user.username}) · ${roleLabel}`
  }

  const renderEnumSelect = (
    id: string,
    label: string,
    value: string,
    items: string[] | undefined,
    labelPrefix: string,
    onChange: (value: string) => void,
  ) => (
    <Select id={id} label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {(items ?? []).map((item) => (
        <option key={item} value={item}>
          {t(`${labelPrefix}.${item}`, item)}
        </option>
      ))}
    </Select>
  )

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label={t('admin.discord.cancel')}
        onClick={onClose}
        disabled={saving}
      />

      <Card glow className="relative z-10 flex max-h-[min(90dvh,56rem)] w-full max-w-3xl flex-col overflow-hidden p-0">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200/70 px-6 py-4 dark:border-slate-700/70">
          <h3 className="font-display text-xl font-bold">
            {editing ? t('admin.roster.edit_title') : t('admin.roster.add_title')}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving} aria-label={t('admin.discord.cancel')}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="police-badge"
            label={t('admin.roster.badge_number')}
            value={form.badge_number}
            onChange={(e) => setField('badge_number', e.target.value)}
          />
          <Input
            id="police-name"
            label={t('admin.roster.name')}
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
          />
          <Input
            id="police-position"
            label={t('admin.roster.position')}
            value={form.position}
            onChange={(e) => setField('position', e.target.value)}
          />
          {renderEnumSelect(
            'police-rank',
            t('admin.roster.rank'),
            form.rank,
            options?.ranks,
            'police.ranks',
            (value) => setField('rank', value as PoliceMemberFormData['rank']),
          )}
          {renderEnumSelect(
            'police-section',
            t('admin.roster.section'),
            form.section,
            options?.sections,
            'police.sections',
            (value) => setField('section', value as PoliceMemberFormData['section']),
          )}
          {renderEnumSelect(
            'police-status',
            t('admin.roster.status'),
            form.status,
            options?.statuses,
            'police.statuses',
            (value) => setField('status', value as PoliceMemberFormData['status']),
          )}
          <div className="sm:col-span-2">
            <Select
              id="police-discord-user"
              label={t('admin.roster.discord_user')}
              value={selectedUserId}
              onChange={(e) => handleUserSelect(e.target.value)}
              disabled={linkableLoading}
            >
              <option value="">{t('admin.roster.discord_user_placeholder')}</option>
              {linkableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {formatLinkableUserLabel(user)}
                </option>
              ))}
            </Select>
            {!linkableLoading && linkableUsers.length === 0 && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{t('admin.roster.discord_user_empty')}</p>
            )}
            {form.discord_id && (
              <p className="mt-1 font-mono text-xs text-slate-500">
                {t('admin.roster.discord_id')}: {form.discord_id}
              </p>
            )}
          </div>
          <Input
            id="police-joined"
            type="date"
            label={t('admin.roster.joined_at')}
            value={form.joined_at}
            onChange={(e) => setField('joined_at', e.target.value)}
          />
          <Input
            id="police-promotion"
            type="date"
            label={t('admin.roster.last_promotion')}
            value={form.last_promotion_date}
            onChange={(e) => setField('last_promotion_date', e.target.value)}
          />
          <Input
            id="police-warnings"
            type="number"
            min={0}
            label={t('admin.roster.warnings')}
            value={form.warnings}
            onChange={(e) => setField('warnings', e.target.value)}
          />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="police-points" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('admin.roster.points')}
              </label>
              <label className="flex shrink-0 items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 sm:text-sm">
                <input
                  type="checkbox"
                  checked={form.points_exempt}
                  onChange={(e) => setField('points_exempt', e.target.checked)}
                  className="size-4 rounded border-slate-300 text-aura-600 focus:ring-aura-500"
                />
                {t('admin.roster.points_exempt')}
              </label>
            </div>
            <input
              id="police-points"
              type="number"
              min={0}
              disabled={form.points_exempt}
              value={form.points_exempt ? '' : form.points}
              placeholder={form.points_exempt ? '—' : undefined}
              onChange={(e) => setField('points', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 transition focus:border-aura-500 focus:outline-none focus:ring-2 focus:ring-aura-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          </div>

          <div className="mt-6">
            <h4 className="mb-3 font-display text-base font-bold">{t('admin.roster.specialties')}</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {POLICE_SPECIALTY_FIELDS.map((field: PoliceSpecialtyField) => (
                <Select
                  key={field}
                  id={`police-${field}`}
                  label={t(`police.specialties.${field}`)}
                  value={form[field]}
                  onChange={(e) => setField(field, e.target.value as PoliceMemberFormData[typeof field])}
                >
                  {(options?.specialty_statuses ?? []).map((status) => (
                    <option key={status} value={status}>
                      {t(`police.specialty_statuses.${status}`, status)}
                    </option>
                  ))}
                </Select>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200/70 px-6 py-4 dark:border-slate-700/70">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t('admin.discord.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={saving}
            disabled={!form.badge_number.trim() || !form.name.trim() || !form.discord_id.trim()}
          >
            {editing ? t('admin.roster.save') : t('admin.roster.add')}
          </Button>
        </div>
      </Card>
    </div>,
    document.body,
  )
}

export function PoliceRosterEditor() {
  const { t } = useTranslation()
  const [members, setMembers] = useState<PoliceMember[]>([])
  const [options, setOptions] = useState<PoliceOptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewing, setViewing] = useState<PoliceMember | null>(null)
  const [editing, setEditing] = useState<PoliceMember | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [filters, setFilters] = useState<PoliceRosterFilters>(EMPTY_POLICE_ROSTER_FILTERS)

  const filteredMembers = useMemo(
    () => filterPoliceRosterMembers(members, filters),
    [members, filters],
  )

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value !== ''),
    [filters],
  )

  const setFilter = <K extends keyof PoliceRosterFilters>(key: K, value: PoliceRosterFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => setFilters(EMPTY_POLICE_ROSTER_FILTERS)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [membersData, optionsData] = await Promise.all([
        fetchAdminPoliceMembers(),
        fetchPoliceOptions(),
      ])
      setMembers(membersData)
      setOptions(optionsData)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openView = (member: PoliceMember) => {
    setViewing(member)
  }

  const openEdit = (member: PoliceMember) => {
    setEditing(member)
    setModalOpen(true)
  }

  const handleSave = async (form: PoliceMemberFormData) => {
    setSaving(true)
    try {
      if (editing) {
        const updated = await updatePoliceMember(editing.id, form)
        setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
      } else {
        const created = await createPoliceMember(form)
        setMembers((prev) => [...prev, created])
      }
      setModalOpen(false)
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (member: PoliceMember) => {
    if (!window.confirm(t('admin.roster.delete_confirm', { name: member.name }))) return

    setDeletingId(member.id)
    try {
      await deletePoliceMember(member.id)
      setMembers((prev) => prev.filter((m) => m.id !== member.id))
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <span className="size-8 animate-spin rounded-full border-2 border-aura-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="space-y-4 text-center">
        <p className="text-slate-500">{t('common.error')}</p>
        <Button size="sm" onClick={() => void load()}>
          {t('common.retry', 'Try again')}
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold">{t('admin.roster.title')}</h3>
          <p className="text-sm text-slate-500">{t('admin.roster.subtitle')}</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          {t('admin.roster.add')}
        </Button>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('admin.roster.filter_title')}</p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              {t('admin.roster.filter_clear')}
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="roster-search"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder={t('admin.roster.filter_search_placeholder')}
            className="ps-10"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            id="filter-rank"
            label={t('admin.roster.rank')}
            value={filters.rank}
            onChange={(e) => setFilter('rank', e.target.value)}
          >
            <option value="">{t('admin.roster.filter_all')}</option>
            {(options?.ranks ?? []).map((rank) => (
              <option key={rank} value={rank}>
                {t(`police.ranks.${rank}`, rank)}
              </option>
            ))}
          </Select>

          <Select
            id="filter-section"
            label={t('admin.roster.section')}
            value={filters.section}
            onChange={(e) => setFilter('section', e.target.value)}
          >
            <option value="">{t('admin.roster.filter_all')}</option>
            {(options?.sections ?? POLICE_SECTION_ORDER).map((section) => (
              <option key={section} value={section}>
                {POLICE_SECTION_LABELS_AR[section]}
              </option>
            ))}
          </Select>

          <Select
            id="filter-status"
            label={t('admin.roster.status')}
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
          >
            <option value="">{t('admin.roster.filter_all')}</option>
            {(options?.statuses ?? []).map((status) => (
              <option key={status} value={status}>
                {t(`police.statuses.${status}`, status)}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POLICE_SPECIALTY_FIELDS.map((field) => (
            <Select
              key={field}
              id={`filter-${field}`}
              label={t(`police.specialties.${field}`)}
              value={filters[field]}
              onChange={(e) => setFilter(field, e.target.value)}
            >
              <option value="">{t('admin.roster.filter_all')}</option>
              {(options?.specialty_statuses ?? []).map((status) => (
                <option key={status} value={status}>
                  {t(`police.specialty_statuses.${status}`, status)}
                </option>
              ))}
            </Select>
          ))}
        </div>
      </Card>

      <Card glow className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 font-medium">{t('admin.roster.badge_number')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.roster.name')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.roster.rank')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.roster.section')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.roster.status')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.roster.warnings')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-mono">{member.badge_number}</td>
                  <td className="px-4 py-3 font-semibold">{member.name}</td>
                  <td className="px-4 py-3">{t(`police.ranks.${member.rank}`, member.rank)}</td>
                  <td className="px-4 py-3">{t(`police.sections.${member.section}`, member.section)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={member.status === 'active' ? 'success' : 'danger'}>
                      {t(`police.statuses.${member.status}`, member.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-red-500">{member.warnings}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openView(member)}
                        aria-label={t('admin.roster.view_member')}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(member)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void handleDelete(member)}
                        isLoading={deletingId === member.id}
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {members.length === 0 && (
          <p className="p-8 text-center text-slate-500">{t('admin.roster.empty')}</p>
        )}
        {members.length > 0 && filteredMembers.length === 0 && (
          <p className="p-8 text-center text-slate-500">{t('admin.roster.filter_no_results')}</p>
        )}
      </Card>

      <PoliceMemberViewModal
        member={viewing}
        onClose={() => setViewing(null)}
        onEdit={openEdit}
      />

      <PoliceMemberFormModal
        open={modalOpen}
        editing={editing}
        options={options}
        saving={saving}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSave={handleSave}
      />
    </div>
  )
}
