interface RulesMarkdownProps {
  content: string
  className?: string
}

export function RulesMarkdown({ content, className }: RulesMarkdownProps) {
  const sections = content.trim().split(/\n(?=## )/g).filter(Boolean)

  if (sections.length === 0) {
    return <p className="text-sm text-slate-600 dark:text-slate-400">{content}</p>
  }

  return (
    <div className={className}>
      {sections.map((section, index) => {
        const lines = section.split('\n').filter((line) => line.trim() !== '')
        const titleLine = lines[0]?.startsWith('## ') ? lines[0].replace(/^##\s+/, '') : null
        const items = lines
          .slice(titleLine ? 1 : 0)
          .map((line) => line.replace(/^[-*]\s+/, '').trim())
          .filter(Boolean)

        return (
          <div key={index} className={index > 0 ? 'mt-8' : undefined}>
            {titleLine && (
              <h2 className="font-display text-xl font-bold">{titleLine}</h2>
            )}
            {items.length > 0 && (
              <ul className="mt-4 space-y-3">
                {items.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-aura-500" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
