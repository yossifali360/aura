import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import {
  createPoliceMember,
  deletePoliceMember,
  fetchAdminPoliceMembers,
  fetchPoliceOptions,
  updatePoliceMember,
} from '@/api/police'
import {
  EMPTY_POLICE_MEMBER_FORM,
  POLICE_SPECIALTY_FIELDS,
  policeMemberToForm,
  type PoliceMember,
  type PoliceMemberFormData,
  type PoliceOptions,
  type PoliceSpecialtyField,
} from '@/types/police'

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

  useEffect(() => {
    if (!open) return
    setForm(editing ? policeMemberToForm(editing) : EMPTY_POLICE_MEMBER_FORM)
  }, [open, editing])

  if (!open) return null

  const setField = <K extends keyof PoliceMemberFormData>(key: K, value: PoliceMemberFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!form.badge_number.trim() || !form.name.trim()) return
    await onSave(form)
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <Card glow className="my-8 w-full max-w-3xl">
        <h3 className="font-display text-xl font-bold">
          {editing ? t('admin.roster.edit_title') : t('admin.roster.add_title')}
        </h3>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
            id="police-shoulder"
            label={t('admin.roster.shoulder_rank')}
            value={form.shoulder_rank}
            onChange={(e) => setField('shoulder_rank', e.target.value)}
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
          <Input
            id="police-discord-user"
            label={t('admin.roster.discord_username')}
            value={form.discord_username}
            onChange={(e) => setField('discord_username', e.target.value)}
          />
          <Input
            id="police-discord-id"
            label={t('admin.roster.discord_id')}
            value={form.discord_id}
            onChange={(e) => setField('discord_id', e.target.value)}
          />
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
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.points_exempt}
                onChange={(e) => setField('points_exempt', e.target.checked)}
                className="size-4 rounded border-slate-300 text-aura-600 focus:ring-aura-500"
              />
              {t('admin.roster.points_exempt')}
            </label>
            {!form.points_exempt && (
              <Input
                id="police-points"
                type="number"
                min={0}
                label={t('admin.roster.points')}
                value={form.points}
                onChange={(e) => setField('points', e.target.value)}
              />
            )}
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

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t('admin.discord.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={saving}
            disabled={!form.badge_number.trim() || !form.name.trim()}
          >
            {editing ? t('admin.roster.save') : t('admin.roster.add')}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export function PoliceRosterEditor() {
  const { t } = useTranslation()
  const [members, setMembers] = useState<PoliceMember[]>([])
  const [options, setOptions] = useState<PoliceOptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PoliceMember | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

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
              {members.map((member) => (
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
      </Card>

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
