import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'

interface SendDiscordMessageModalProps {
  open: boolean
  recipientCount: number
  isLoading?: boolean
  onClose: () => void
  onSend: (message: string) => Promise<void>
}

export function SendDiscordMessageModal({
  open,
  recipientCount,
  isLoading,
  onClose,
  onSend,
}: SendDiscordMessageModalProps) {
  const { t } = useTranslation()
  const [message, setMessage] = useState('')

  if (!open) return null

  const handleSubmit = async () => {
    if (!message.trim()) return
    await onSend(message.trim())
    setMessage('')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card glow className="w-full max-w-lg">
        <h3 className="font-display text-xl font-bold">{t('admin.discord.title')}</h3>
        <p className="mt-2 text-sm text-slate-500">
          {t('admin.discord.subtitle', { count: recipientCount })}
        </p>

        <div className="mt-4">
          <Textarea
            id="discord-message"
            label={t('admin.discord.message_label')}
            className="min-h-[140px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('admin.discord.message_placeholder')}
          />
          <p className="mt-2 text-xs text-slate-500">{t('admin.discord.sender_note')}</p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('admin.discord.cancel')}
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading} disabled={!message.trim()}>
            <Send className="size-4" />
            {t('admin.discord.send')}
          </Button>
        </div>
      </Card>
    </div>
  )
}
