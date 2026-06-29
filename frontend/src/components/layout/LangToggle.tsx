import { useTranslation } from 'react-i18next'
import type { Language } from '@/types'
import { cn } from '@/utils/cn'

const languages: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
]

export function LangToggle({ className }: { className?: string }) {
  const { i18n } = useTranslation()

  const changeLang = (code: Language) => {
    i18n.changeLanguage(code)
    localStorage.setItem('aura-lang', code)
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = code
  }

  return (
    <div className={cn('flex items-center gap-1 rounded-xl glass p-1', className)}>
      {/* <Globe className="ml-2 size-4 text-slate-500" /> */}
      {languages.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => changeLang(code)}
          className={cn(
            'rounded-lg px-2 py-1 text-xs font-bold transition cursor-pointer',
            i18n.language === code
              ? 'bg-aura-600 text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
