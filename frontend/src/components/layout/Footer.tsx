import { useTranslation } from 'react-i18next'
import { MessageCircle } from 'lucide-react'
import { DEVELOPER, getDeveloperDiscordUrl } from '@/config/developer'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const discordUrl = getDeveloperDiscordUrl()

  return (
    <footer className="border-t border-slate-200/50 dark:border-slate-800/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1.5 px-4 py-5 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 font-display text-sm font-bold">
          <img src="/image.png" alt="" className="size-4 object-contain" />
          <span className="neon-text">Aura Cfw</span>
        </div>
        <p>{t('footer.tagline')}</p>
        <p>© {year} Aura Cfw. {t('footer.rights')}</p>
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1">
          <span>{t('footer.developed_by')}</span>
          <span className="font-medium text-slate-600 dark:text-slate-300">{DEVELOPER.name}</span>
          <span aria-hidden>·</span>
          {discordUrl ? (
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-[#5865F2] transition hover:underline"
            >
              <MessageCircle className="size-3.5" />
              @{DEVELOPER.discordUsername}
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium text-[#5865F2]">
              <MessageCircle className="size-3.5" />
              @{DEVELOPER.discordUsername}
            </span>
          )}
        </p>
      </div>
    </footer>
  )
}
