import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface ApplicationThankYouModalProps {
  open: boolean
  i18nKey: 'apply' | 'apply_police' | 'apply_ems'
  onClose: () => void
}

export function ApplicationThankYouModal({ open, i18nKey, onClose }: ApplicationThankYouModalProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-thank-you-title"
    >
      <Card glow className="w-full max-w-md text-center">
        <CheckCircle2 className="mx-auto size-14 text-emerald-500" />
        <h3 id="application-thank-you-title" className="mt-4 font-display text-2xl font-bold">
          {t(`${i18nKey}.thank_you_title`)}
        </h3>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{t(`${i18nKey}.thank_you_message`)}</p>
        <Button className="mt-6 w-full" onClick={onClose}>
          {t(`${i18nKey}.thank_you_close`)}
        </Button>
      </Card>
    </div>,
    document.body,
  )
}
