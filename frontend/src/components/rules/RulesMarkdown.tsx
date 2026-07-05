import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface RulesMarkdownProps {
  content: string
  className?: string
  collapsible?: boolean
  previewItems?: number
}

interface ParsedSection {
  title: string | null
  items: string[]
}

function parseRulesSections(content: string): ParsedSection[] {
  const sections = content.trim().split(/\n(?=## )/g).filter(Boolean)

  if (sections.length === 0) {
    const text = content.trim()
    return text ? [{ title: null, items: [text] }] : []
  }

  return sections.map((section) => {
    const lines = section.split('\n').filter((line) => line.trim() !== '')
    const titleLine = lines[0]?.startsWith('## ') ? lines[0].replace(/^##\s+/, '') : null
    const items = lines
      .slice(titleLine ? 1 : 0)
      .map((line) => line.replace(/^[-*]\s+/, '').trim())
      .filter(Boolean)

    return { title: titleLine, items }
  })
}

function flattenSections(sections: ParsedSection[]): Array<{ title: string | null; text: string }> {
  return sections.flatMap((section) =>
    section.items.map((text) => ({ title: section.title, text })),
  )
}

const PREVIEW_CHARS = 220

function truncateLongSingleSection(sections: ParsedSection[]): ParsedSection[] {
  if (sections.length !== 1 || sections[0].items.length !== 1) {
    return sections
  }

  const text = sections[0].items[0]
  if (text.length <= PREVIEW_CHARS) {
    return sections
  }

  return [{ ...sections[0], items: [`${text.slice(0, PREVIEW_CHARS).trim()}…`] }]
}

function groupVisibleItems(
  sections: ParsedSection[],
  visibleItems: Array<{ title: string | null; text: string }>,
): ParsedSection[] {
  const grouped = new Map<string | null, string[]>()

  for (const item of visibleItems) {
    const existing = grouped.get(item.title) ?? []
    existing.push(item.text)
    grouped.set(item.title, existing)
  }

  const orderedTitles = sections.map((section) => section.title).filter((title, index, list) => list.indexOf(title) === index)

  return orderedTitles
    .filter((title) => grouped.has(title))
    .map((title) => ({
      title,
      items: grouped.get(title) ?? [],
    }))
}

function RulesSections({ sections }: { sections: ParsedSection[] }) {
  return (
    <>
      {sections.map((section, index) => (
        <div key={`${section.title ?? 'section'}-${index}`} className={index > 0 ? 'mt-8' : undefined}>
          {section.title && (
            <h2 className="font-display text-xl font-bold">{section.title}</h2>
          )}
          {section.items.length > 0 && (
            <ul className={cn('space-y-3', section.title ? 'mt-4' : undefined)}>
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-aura-500" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  )
}

export function RulesMarkdown({
  content,
  className,
  collapsible = false,
  previewItems = 3,
}: RulesMarkdownProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const sections = useMemo(() => parseRulesSections(content), [content])
  const flatItems = useMemo(() => flattenSections(sections), [sections])
  const isLongSingleBlock =
    sections.length === 1 && sections[0].items.length === 1 && sections[0].items[0].length > PREVIEW_CHARS
  const canCollapse = collapsible && (flatItems.length > previewItems || isLongSingleBlock)

  const visibleSections = useMemo(() => {
    if (!canCollapse || expanded) return sections
    if (isLongSingleBlock) return truncateLongSingleSection(sections)
    return groupVisibleItems(sections, flatItems.slice(0, previewItems))
  }, [canCollapse, expanded, flatItems, isLongSingleBlock, previewItems, sections])

  if (sections.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <div className="relative">
        <RulesSections sections={visibleSections} />
        {canCollapse && !expanded && (
          <div
            className="pointer-events-none cursor-pointer absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/70 via-white/40 to-transparent dark:from-slate-900/60 dark:via-slate-900/30"
            aria-hidden
          />
        )}
      </div>

      {canCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-aura-600 transition hover:text-aura-700 dark:text-aura-400 dark:hover:text-aura-300"
        >
          {expanded ? t('common.see_less') : t('common.see_more')}
          <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
        </button>
      )}
    </div>
  )
}
