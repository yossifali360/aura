import { BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { RulesMarkdown } from '@/components/rules/RulesMarkdown'
import { useRulesStore } from '@/store/rulesStore'
import type { ApplicationType } from '@/types'

interface ApplicationRulesPanelProps {
  type: ApplicationType
}

export function ApplicationRulesPanel({ type }: ApplicationRulesPanelProps) {
  const getForType = useRulesStore((s) => s.getForType)
  const content = getForType(type, 'ar')

  if (!content) return null

  return (
    <Card glow className="mb-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-aura-600 dark:bg-slate-800 dark:text-aura-400">
          <BookOpen className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold">{content.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{content.subtitle}</p>
        </div>
      </div>
      <RulesMarkdown content={content.content} />
    </Card>
  )
}
