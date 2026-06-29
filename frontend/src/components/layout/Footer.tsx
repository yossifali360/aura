import { useTranslation } from 'react-i18next'
export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200/50 dark:border-slate-800/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 font-display font-bold">
          <img src="/image.png" alt="" className="size-5 object-contain" />
          <span className="neon-text">Aura Cfw</span>
        </div>
        <p>{t('footer.tagline')}</p>
        <p>© {year} Aura Cfw. {t('footer.rights')}</p>
      </div>
    </footer>
  )
}
