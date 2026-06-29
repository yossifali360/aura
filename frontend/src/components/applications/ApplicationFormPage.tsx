import { useEffect, useMemo, useState } from 'react'
import { useFormik } from 'formik'
import { useTranslation } from 'react-i18next'
import { ClipboardCheck, Lock, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ApplicationRulesPanel } from '@/components/applications/ApplicationRulesPanel'
import { ApplicationThankYouModal } from '@/components/applications/ApplicationThankYouModal'
import { useAuthStore } from '@/store/authStore'
import { useApplicationSettingsStore } from '@/store/applicationSettingsStore'
import { useRulesStore } from '@/store/rulesStore'
import { getDiscordLoginUrl } from '@/api/auth'
import { fetchMyApplication, submitApplication } from '@/api/applications'
import {
  applicationInitialValues,
  createApplicationSchema,
} from '@/schemas/applicationSchema'
import { mapBackendValidationErrors } from '@/utils/validationErrors'
import type { Application, ApplicationType } from '@/types'

interface ApplicationFormPageProps {
  type: ApplicationType
  i18nKey: 'apply' | 'apply_police' | 'apply_ems'
}

export function ApplicationFormPage({ type, i18nKey }: ApplicationFormPageProps) {
  const { t } = useTranslation()
  const { user, token } = useAuthStore()
  const { settings, isLoading: settingsLoading, load: loadSettings } = useApplicationSettingsStore()
  const { isLoading: rulesLoading, load: loadRules } = useRulesStore()
  const [existingApp, setExistingApp] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showThankYou, setShowThankYou] = useState(false)
  const [pendingApp, setPendingApp] = useState<Application | null>(null)

  const isEnabled = settings?.[type] ?? false
  const validationSchema = useMemo(() => createApplicationSchema(t), [t])

  const formik = useFormik({
    initialValues: applicationInitialValues,
    validationSchema,
    onSubmit: async (values, { setErrors, resetForm, setSubmitting }) => {
      setSubmitError('')

      try {
        const result = await submitApplication({
          type,
          age: Number(values.age),
          experience: values.experience,
          character_concept: values.character_concept,
          why_join: values.why_join,
          rules_accepted: values.rules_accepted,
        })
        resetForm()
        setPendingApp(result)
        setShowThankYou(true)
      } catch (error) {
        const fieldErrors = mapBackendValidationErrors(error)
        if (fieldErrors) {
          setErrors(fieldErrors)
        } else {
          setSubmitError(t('common.error'))
        }
      } finally {
        setSubmitting(false)
      }
    },
  })

  useEffect(() => {
    loadSettings()
    loadRules()
  }, [loadSettings, loadRules])

  useEffect(() => {
    if (!token || !user) return

    let active = true
    setIsLoading(true)

    fetchMyApplication(type)
      .then((app) => {
        if (active) setExistingApp(app)
      })
      .catch(() => {
        if (active) setExistingApp(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [token, user, type])

  const handleThankYouClose = () => {
    setShowThankYou(false)
    if (pendingApp) {
      setExistingApp(pendingApp)
      setPendingApp(null)
    }
  }

  const statusVariant = (status: Application['status']) => {
    if (status === 'approved') return 'success'
    if (status === 'rejected') return 'danger'
    return 'warning'
  }

  const statusLabel = (status: Application['status']) => {
    if (status === 'approved') return t(`${i18nKey}.status_approved`)
    if (status === 'rejected') return t(`${i18nKey}.status_rejected`)
    return t(`${i18nKey}.status_pending`)
  }

  if (settingsLoading || rulesLoading || (user && isLoading)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="size-8 animate-spin rounded-full border-2 border-aura-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <ApplicationThankYouModal open={showThankYou} i18nKey={i18nKey} onClose={handleThankYouClose} />

      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold">{t(`${i18nKey}.title`)}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{t(`${i18nKey}.subtitle`)}</p>
        {!isEnabled && !existingApp && (
          <Badge variant="danger" className="mt-4">
            {t('common.applications_closed')}
          </Badge>
        )}
      </div>

      <ApplicationRulesPanel type={type} />

      {existingApp ? (
        <Card glow className="text-center">
          <ClipboardCheck className="mx-auto size-12 text-emerald-500" />
          <h2 className="mt-4 font-display text-2xl font-bold">{t(`${i18nKey}.status_title`)}</h2>
          <Badge variant={statusVariant(existingApp.status)} className="mt-4">
            {statusLabel(existingApp.status)}
          </Badge>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            {existingApp.character_concept.slice(0, 120)}...
          </p>
        </Card>
      ) : !isEnabled ? (
        <Card glow className="text-center">
          <Lock className="mx-auto size-12 text-slate-400" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">{t('common.applications_closed_desc')}</p>
        </Card>
      ) : !user ? (
        <Card glow className="text-center">
          <LogIn className="mx-auto size-12 text-aura-600 dark:text-aura-400" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">{t(`${i18nKey}.login_required`)}</p>
          <Button variant="discord" className="mt-6" onClick={() => { window.location.href = getDiscordLoginUrl() }}>
            {t('nav.login')}
          </Button>
        </Card>
      ) : (
        <Card glow>
          <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
            <Input
              id={`${type}-age`}
              name="age"
              type="number"
              min={16}
              max={99}
              label={t(`${i18nKey}.age`)}
              placeholder={t(`${i18nKey}.age_placeholder`)}
              value={formik.values.age}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={(formik.touched.age || formik.submitCount > 0) ? formik.errors.age : undefined}
            />
            <Textarea
              id={`${type}-experience`}
              name="experience"
              label={t(`${i18nKey}.experience`)}
              placeholder={t(`${i18nKey}.experience_placeholder`)}
              value={formik.values.experience}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={(formik.touched.experience || formik.submitCount > 0) ? formik.errors.experience : undefined}
            />
            <Textarea
              id={`${type}-character`}
              name="character_concept"
              label={t(`${i18nKey}.character`)}
              placeholder={t(`${i18nKey}.character_placeholder`)}
              value={formik.values.character_concept}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={(formik.touched.character_concept || formik.submitCount > 0) ? formik.errors.character_concept : undefined}
            />
            <Textarea
              id={`${type}-why_join`}
              name="why_join"
              label={t(`${i18nKey}.why_join`)}
              placeholder={t(`${i18nKey}.why_join_placeholder`)}
              value={formik.values.why_join}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={(formik.touched.why_join || formik.submitCount > 0) ? formik.errors.why_join : undefined}
            />

            <div className="space-y-1.5">
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  name="rules_accepted"
                  checked={formik.values.rules_accepted}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="mt-0.5 size-4 rounded border-slate-300 text-aura-600 focus:ring-aura-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">{t(`${i18nKey}.rules_accept`)}</span>
              </label>
              {(formik.touched.rules_accepted || formik.submitCount > 0) && formik.errors.rules_accepted && (
                <p className="text-sm text-red-500">{formik.errors.rules_accepted}</p>
              )}
            </div>

            {submitError && <p className="text-sm text-red-500">{submitError}</p>}

            <Button type="submit" className="w-full" isLoading={formik.isSubmitting}>
              {formik.isSubmitting ? t(`${i18nKey}.submitting`) : t(`${i18nKey}.submit`)}
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
