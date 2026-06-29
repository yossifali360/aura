import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/locales/en.json'
import ar from '@/locales/ar.json'

const stored = localStorage.getItem('aura-lang')
const savedLang = stored === 'ar' ? 'ar' : 'en'

if (savedLang === 'ar') {
  document.documentElement.dir = 'rtl'
  document.documentElement.lang = 'ar'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
