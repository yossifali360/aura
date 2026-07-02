import { useTranslation } from 'react-i18next'
import { ExternalLink, MessageCircle, Sparkles } from 'lucide-react'
import { DEVELOPER, getDeveloperDiscordUrl } from '@/config/developer'
import { DiscordAvatar } from '@/components/ui/DiscordAvatar'
import { useDiscordAvatars } from '@/hooks/useDiscordAvatars'
import { getDiscordAvatarUrl } from '@/utils/discordAvatar'
import { cn } from '@/utils/cn'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const discordUrl = getDeveloperDiscordUrl()
  const avatars = useDiscordAvatars([DEVELOPER.discordId])
  const developerAvatar =
    avatars[DEVELOPER.discordId] ?? getDiscordAvatarUrl(DEVELOPER.discordId, undefined, DEVELOPER.name)

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-slate-200/60 dark:border-slate-800/60">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(239,68,68,0.08),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_bottom,rgba(239,68,68,0.12),transparent_65%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2.5">
            <img
              src="/image.png"
              alt=""
              className="size-8 object-contain drop-shadow-[0_0_12px_rgba(239,68,68,0.35)]"
            />
            <span className="font-display text-lg font-bold tracking-wide neon-text">Aura Cfw</span>
          </div>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{t('footer.tagline')}</p>
        </div>

        <div className="mx-auto mt-6 max-w-lg">
          <div
            className={cn(
              'group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/60 p-4 shadow-sm backdrop-blur-xl',
              'dark:border-slate-700/60 dark:bg-slate-900/50',
              'transition duration-300 hover:border-aura-500/30 hover:shadow-md hover:shadow-aura-500/10',
            )}
          >
            <div
              className="pointer-events-none absolute -end-6 -top-6 size-24 rounded-full bg-aura-500/10 blur-2xl transition group-hover:bg-aura-500/20"
              aria-hidden
            />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <DiscordAvatar
                    src={developerAvatar}
                    fallbackSrc={getDiscordAvatarUrl('', undefined, DEVELOPER.name)}
                    alt={DEVELOPER.name}
                    className="size-11 rounded-xl object-cover shadow-lg shadow-aura-500/30 ring-2 ring-aura-500/20"
                  />
                  <span className="absolute -bottom-1 -end-1 flex size-5 items-center justify-center rounded-full border border-white bg-slate-900 text-aura-400 dark:border-slate-900">
                    <Sparkles className="size-3" />
                  </span>
                </div>

                <div className="text-start">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    {t('footer.developed_by')}
                  </p>
                  <p className="font-display text-base font-bold text-slate-800 dark:text-slate-100">
                    {DEVELOPER.name}
                  </p>
                </div>
              </div>

              {discordUrl ? (
                <a
                  href={discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                    'bg-[#5865F2]/10 text-[#5865F2] ring-1 ring-[#5865F2]/20',
                    'hover:bg-[#5865F2] hover:text-white hover:ring-[#5865F2]/40',
                  )}
                >
                  <MessageCircle className="size-4" />
                  <span>@{DEVELOPER.discordUsername}</span>
                  <ExternalLink className="size-3.5 opacity-60" />
                </a>
              ) : (
                <span
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold',
                    'bg-[#5865F2]/10 text-[#5865F2] ring-1 ring-[#5865F2]/20',
                  )}
                >
                  <MessageCircle className="size-4" />
                  <span>@{DEVELOPER.discordUsername}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          © {year} Aura Cfw · {t('footer.rights')}
        </p>
      </div>
    </footer>
  )
}
