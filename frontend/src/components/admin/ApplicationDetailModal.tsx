import { useEffect, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { Application, ApplicationType } from '@/types'

const I18N_KEY: Record<ApplicationType, 'apply' | 'apply_police' | 'apply_ems'> = {
  server: 'apply',
  police: 'apply_police',
  ems: 'apply_ems',
}

const FIELDS: Record<ApplicationType, { key: keyof Application; labelKey: string }[]> = {
  server: [
    { key: 'real_name', labelKey: 'real_name' },
    { key: 'age', labelKey: 'age' },
    { key: 'character_concept', labelKey: 'city_character_name' },
    { key: 'experience', labelKey: 'steam_link' },
    { key: 'why_join', labelKey: 'character_story' },
    { key: 'rules_accepted', labelKey: 'rules_accept' },
  ],
  police: [
    { key: 'age', labelKey: 'age' },
    { key: 'character_concept', labelKey: 'character_name' },
    { key: 'why_join', labelKey: 'why_accept' },
    { key: 'experience', labelKey: 'police_experience' },
    { key: 'rules_accepted', labelKey: 'rules_accept' },
  ],
  ems: [
    { key: 'age', labelKey: 'age' },
    { key: 'experience', labelKey: 'experience' },
    { key: 'character_concept', labelKey: 'character' },
    { key: 'why_join', labelKey: 'why_join' },
    { key: 'rules_accepted', labelKey: 'rules_accept' },
  ],
}

interface ApplicationDetailModalProps {
  open: boolean
  application: Application | null
  applicationType: ApplicationType
  updatingId: number | null
  onClose: () => void
  onStatus: (id: number, status: Application['status']) => void
}

export function ApplicationDetailModal({
  open,
  application,
  applicationType,
  updatingId,
  onClose,
  onStatus,
}: ApplicationDetailModalProps) {
  const { t } = useTranslation()
  const i18nKey = I18N_KEY[applicationType]

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && updatingId !== application?.id) onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose, updatingId, application?.id])

  if (!open || !application) return null

  const isUpdating = updatingId === application.id
  const statusVariant =
    application.status === 'approved' ? 'success' : application.status === 'rejected' ? 'danger' : 'warning'

  const formatValue = (key: keyof Application, value: unknown) => {
    if (key === 'rules_accepted') {
      return value ? t('admin.applications.detail.rules_yes') : t('admin.applications.detail.rules_no')
    }
    if (value === null || value === undefined || value === '') {
      return t('admin.applications.detail.not_provided')
    }
    return String(value)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-detail-title"
      onClick={() => {
        if (!isUpdating) onClose()
      }}
    >
      <div onClick={(e: MouseEvent) => e.stopPropagation()}>
        <Card
          glow
          className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden"
        >
        <div className="shrink-0 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {application.user?.avatar && (
                <img src={application.user.avatar} alt="" className="size-12 rounded-full" />
              )}
              <div>
                <h3 id="application-detail-title" className="font-display text-xl font-bold">
                  {t('admin.applications.detail.title')}
                </h3>
                <p className="text-sm text-slate-500">
                  {application.user?.first_name} · @{application.user?.username}
                </p>
              </div>
            </div>
            <Badge variant={statusVariant}>{application.status}</Badge>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {FIELDS[applicationType].map(({ key, labelKey }) => (
            <div key={key}>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t(`${i18nKey}.${labelKey}`)}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">
                {formatValue(key, application[key])}
              </p>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <Button variant="secondary" onClick={onClose} disabled={isUpdating}>
            {t('admin.applications.detail.close')}
          </Button>
          <Button
            variant="ghost"
            disabled={isUpdating || application.status === 'rejected'}
            onClick={() => onStatus(application.id, 'rejected')}
          >
            <X className="size-4 text-red-500" />
            {t('admin.applications.detail.reject')}
          </Button>
          <Button
            disabled={isUpdating || application.status === 'approved'}
            onClick={() => onStatus(application.id, 'approved')}
          >
            <Check className="size-4" />
            {t('admin.applications.detail.accept')}
          </Button>
        </div>
      </Card>
      </div>
    </div>,
    document.body,
  )
}
