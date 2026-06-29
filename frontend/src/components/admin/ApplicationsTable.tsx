import { useTranslation } from 'react-i18next'
import { Check, MessageSquare, Trash2, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Application } from '@/types'

interface ApplicationsTableProps {
  applications: Application[]
  updatingId: number | null
  selectedIds: number[]
  messaging: boolean
  onStatus: (id: number, status: Application['status']) => void
  onToggleSelect: (id: number) => void
  onToggleSelectAll: () => void
  onSendToOne: (id: number) => void
  onSendToSelected: () => void
  onDelete: (id: number) => void
  deletingId: number | null
  emptyMessage: string
}

export function ApplicationsTable({
  applications,
  updatingId,
  selectedIds,
  messaging,
  onStatus,
  onToggleSelect,
  onToggleSelectAll,
  onSendToOne,
  onSendToSelected,
  onDelete,
  deletingId,
  emptyMessage,
}: ApplicationsTableProps) {
  const { t } = useTranslation()
  const allSelected = applications.length > 0 && selectedIds.length === applications.length

  return (
    <Card glow className="overflow-hidden p-0">
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <p className="text-sm text-slate-500">
            {t('admin.discord.selected', { count: selectedIds.length })}
          </p>
          <Button size="sm" onClick={onSendToSelected} isLoading={messaging}>
            <MessageSquare className="size-4" />
            {t('admin.discord.send_selected')}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="size-4 rounded border-slate-300 text-aura-600 focus:ring-aura-500"
                  aria-label={t('admin.discord.select_all')}
                />
              </th>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">{t('admin.table.user')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.table.age')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.table.status')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(app.id)}
                    onChange={() => onToggleSelect(app.id)}
                    className="size-4 rounded border-slate-300 text-aura-600 focus:ring-aura-500"
                    aria-label={t('admin.discord.select_user', { name: app.user?.first_name ?? app.id })}
                  />
                </td>
                <td className="px-4 py-3">{app.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {app.user?.avatar && (
                      <img src={app.user.avatar} alt="" className="size-8 rounded-full" />
                    )}
                    <div>
                      <p className="font-medium">{app.user?.first_name}</p>
                      <p className="text-xs text-slate-500">@{app.user?.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{app.age}</td>
                <td className="px-4 py-3">
                  <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>
                    {app.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      title={t('admin.discord.send_one')}
                      disabled={messaging}
                      onClick={() => onSendToOne(app.id)}
                    >
                      <MessageSquare className="size-4 text-aura-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={updatingId === app.id || app.status === 'approved'}
                      onClick={() => onStatus(app.id, 'approved')}
                    >
                      <Check className="size-4 text-emerald-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={updatingId === app.id || app.status === 'rejected'}
                      onClick={() => onStatus(app.id, 'rejected')}
                    >
                      <X className="size-4 text-red-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title={t('admin.applications.delete')}
                      disabled={deletingId === app.id || updatingId === app.id}
                      onClick={() => onDelete(app.id)}
                    >
                      <Trash2 className="size-4 text-slate-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
