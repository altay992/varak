import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { engine } from '@/lib/config'
import { storage } from '@/lib/storage'
import { createFormat, type Format, type Locale } from './format'
import { en } from './locales/en'
import { tr, type Messages } from './locales/tr'
import { toEnglish } from './serverMessages'

const MESSAGES: Record<Locale, Messages> = { tr, en }
export const LOCALES: Locale[] = ['tr', 'en']

interface I18n {
  locale: Locale
  setLocale: (locale: Locale) => void
  /** Arayüz metinleri. */
  t: Messages
  /** Dile göre saat, süre, sayı, boyut. */
  f: Format
  /** Motorun dil anahtarını ("İngilizce") seçili dilde gösterir. */
  language: (key: string) => string
  /** Motorun üslup anahtarını ("Doğal") seçili dilde gösterir. */
  tone: (key: string) => string
  /** Sunucudan gelen Türkçe hata mesajını seçili dile çevirir. */
  message: (text: string) => string
}

const Context = createContext<I18n | null>(null)

function initialLocale(): Locale {
  const saved = storage.get('locale')
  if (saved === 'tr' || saved === 'en') return saved
  return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    storage.set('locale', next)
  }, [])

  useEffect(() => { document.documentElement.lang = locale }, [locale])

  const value = useMemo<I18n>(() => {
    const t = MESSAGES[locale]
    return {
      locale,
      setLocale,
      t,
      f: createFormat(locale),
      language: (key) => (locale === 'en' ? engine.englishName(key) : key),
      tone: (key) => t.tones[key] ?? key,
      message: (text) => (locale === 'en' ? toEnglish(text) : text)
    }
  }, [locale, setLocale])

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useI18n(): I18n {
  const value = useContext(Context)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}
