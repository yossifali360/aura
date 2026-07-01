import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Save } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { RulesMarkdown } from '@/components/rules/RulesMarkdown'
import { updateAdminRules } from '@/api/admin'
import { useRulesStore } from '@/store/rulesStore'
import type { AllRulesContent, ApplicationType, Language, RulesByLocale, RulesLocaleContent } from '@/types'

const EMPTY_LOCALE: RulesLocaleContent = { title: '', subtitle: '', content: '' }
const EMPTY_RULES_BY_LOCALE: RulesByLocale = { en: EMPTY_LOCALE, ar: EMPTY_LOCALE }

interface RulesEditorProps {
  initialRules: AllRulesContent
  onSaved: (rules: AllRulesContent) => void
  editableTypes: readonly ApplicationType[]
}

function LocaleFields({
  locale,
  idPrefix,
  values,
  onChange,
}: {
  locale: Language
  idPrefix: string
  values: RulesLocaleContent
  onChange: (field: keyof RulesLocaleContent, value: string) => void
}) {
  const { t } = useTranslation()
  const isRtl = locale === 'ar'

  return (
    <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <h4 className="font-display text-base font-bold">{t('admin.rules.arabic')}</h4>
      <Input
        id={`${idPrefix}-${locale}-title`}
        label={t('admin.rules.page_title')}
        value={values.title}
        onChange={(e) => onChange('title', e.target.value)}
        dir={isRtl ? 'rtl' : 'ltr'}
        className={isRtl ? 'text-right' : undefined}
      />
      <Input
        id={`${idPrefix}-${locale}-subtitle`}
        label={t('admin.rules.page_subtitle')}
        value={values.subtitle}
        onChange={(e) => onChange('subtitle', e.target.value)}
        dir={isRtl ? 'rtl' : 'ltr'}
        className={isRtl ? 'text-right' : undefined}
      />
      <Textarea
        id={`${idPrefix}-${locale}-content`}
        label={t('admin.rules.content')}
        className={`min-h-[280px] font-mono text-sm ${isRtl ? 'text-right' : ''}`}
        value={values.content}
        onChange={(e) => onChange('content', e.target.value)}
        dir={isRtl ? 'rtl' : 'ltr'}
      />
    </div>
  )
}

function LocalePreview({ locale, values }: { locale: Language; values: RulesLocaleContent }) {
  const { t } = useTranslation()
  const isRtl = locale === 'ar'

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <h4 className="mb-4 font-display text-base font-bold">{t('admin.rules.preview_ar')}</h4>
      <div className={`mb-6 text-center ${isRtl ? 'text-right md:text-center' : ''}`}>
        <h1 className="font-display text-xl font-bold">{values.title || '—'}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{values.subtitle || '—'}</p>
      </div>
      {values.content ? (
        <RulesMarkdown content={values.content} />
      ) : (
        <p className="text-sm text-slate-500">{t('admin.rules.empty_preview')}</p>
      )}
    </div>
  )
}

export function RulesEditor({ initialRules, onSaved, editableTypes }: RulesEditorProps) {
  const { t } = useTranslation()
  const refreshPublicRules = useRulesStore((s) => s.refresh)
  const [rules, setRules] = useState<AllRulesContent>(initialRules)
  const [ruleType, setRuleType] = useState<ApplicationType>(editableTypes[0] ?? 'server')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setRules(initialRules)
  }, [initialRules])

  useEffect(() => {
    if (!editableTypes.includes(ruleType)) {
      setRuleType(editableTypes[0] ?? 'server')
    }
  }, [editableTypes, ruleType])

  const updateLocale = (locale: Language, field: keyof RulesLocaleContent, value: string) => {
    setRules((prev) => ({
      ...prev,
      [ruleType]: {
        ...prev[ruleType],
        [locale]: { ...prev[ruleType][locale], [field]: value },
      },
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateAdminRules(rules)
      setRules(updated)
      onSaved(updated)
      await refreshPublicRules()
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const current = rules[ruleType] ?? EMPTY_RULES_BY_LOCALE

  if (editableTypes.length === 0) {
    return (
      <Card className="text-center text-slate-500">
        {t('common.error')}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card glow>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-aura-500/15 text-aura-600 dark:text-aura-400">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">{t('admin.rules.editor_title')}</h3>
              <p className="text-sm text-slate-500">{t('admin.rules.editor_desc')}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {editableTypes.map((type) => (
              <Button
                key={type}
                size="sm"
                variant={ruleType === type ? 'primary' : 'secondary'}
                onClick={() => setRuleType(type)}
              >
                {t(`admin.types.${type}`)}
              </Button>
            ))}
          </div>
        </div>

        <LocaleFields
          locale="ar"
          idPrefix={ruleType}
          values={current.ar}
          onChange={(field, value) => updateLocale('ar', field, value)}
        />

        <p className="mt-4 text-xs text-slate-500">{t('admin.rules.markdown_hint')}</p>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSave} isLoading={saving}>
            <Save className="size-4" />
            {t('admin.rules.save')}
          </Button>
          {saved && <span className="text-sm text-emerald-500">{t('admin.rules.saved')}</span>}
        </div>
      </Card>

      <Card glow>
        <LocalePreview locale="ar" values={current.ar} />
      </Card>
    </div>
  )
}
