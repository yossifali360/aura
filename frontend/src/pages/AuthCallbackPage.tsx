import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDiscordLoginUrl } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export function AuthCallbackPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setToken = useAuthStore((s) => s.setToken)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const authError = params.get('error')

    if (authError) {
      setError(authError === 'oauth_failed' ? t('auth.login_failed') : authError)
      return
    }

    const token = params.get('token')

    if (!token) {
      navigate('/', { replace: true })
      return
    }

    setToken(token).then(() => {
      const user = useAuthStore.getState().user
      navigate(user ? '/apply' : '/', { replace: true })
    })
  }, [params, setToken, navigate, t])

  if (error) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-slate-700 dark:text-slate-300">{error}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('auth.login_retry')}</p>
          <a
            href={getDiscordLoginUrl()}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#5865F2] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4752C4]"
          >
            {t('auth.login_again')}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <span className="mx-auto block size-10 animate-spin rounded-full border-2 border-aura-500 border-t-transparent" />
        <p className="mt-4 text-slate-600 dark:text-slate-400">{t('common.loading')}</p>
      </div>
    </div>
  )
}
