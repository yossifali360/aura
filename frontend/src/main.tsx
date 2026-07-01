import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@/config/i18n'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useApplicationSettingsStore } from '@/store/applicationSettingsStore'
import { useRulesStore } from '@/store/rulesStore'
import { AppLoader } from '@/components/animation/AppLoader'
import App from './App'
import './index.css'

function Root() {
  const [ready, setReady] = useState(false)

  if (!ready) {
    return <AppLoader onComplete={() => setReady(true)} />
  }

  return (
    <StrictMode>
      <AppBootstrap />
    </StrictMode>
  )
}

function AppBootstrap() {
  const fetchUser = useAuthStore((s) => s.fetchUser)
  const loadApplicationSettings = useApplicationSettingsStore((s) => s.load)
  const loadRules = useRulesStore((s) => s.load)
  const setTheme = useThemeStore((s) => s.setTheme)
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    setTheme(theme)
  }, [setTheme, theme])

  useEffect(() => {
    fetchUser()
    loadApplicationSettings()
    loadRules()
  }, [fetchUser, loadApplicationSettings, loadRules])

  return <App />
}

createRoot(document.getElementById('root')!).render(<Root />)
