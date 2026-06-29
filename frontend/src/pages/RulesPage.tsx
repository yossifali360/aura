import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { RulesMarkdown } from '@/components/rules/RulesMarkdown'
import { useRulesStore } from '@/store/rulesStore'
import type { ApplicationType, Language } from '@/types'

interface RulesPageProps {
  type?: ApplicationType
}

export function RulesPage({ type = 'server' }: RulesPageProps) {
  const { i18n } = useTranslation()
  const { isLoading, load, getForType } = useRulesStore()
  const locale = (i18n.language === 'ar' ? 'ar' : 'en') as Language
  const content = getForType(type, locale)

  useEffect(() => {
    load()
  }, [load])

  if (isLoading || !content) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="size-8 animate-spin rounded-full border-2 border-aura-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="font-display text-3xl font-bold md:text-4xl">{content.title}</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{content.subtitle}</p>
      </div>

      <RevealOnScroll>
        <Card glow>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-aura-600 dark:bg-slate-800 dark:text-aura-400">
              <BookOpen className="size-5" />
            </div>
            <h2 className="font-display text-xl font-bold">{content.title}</h2>
          </div>
          <RulesMarkdown content={content.content} />
        </Card>
      </RevealOnScroll>
    </div>
  )
}
