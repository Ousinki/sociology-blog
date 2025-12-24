'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Supported languages
export type Locale = 'zh' | 'en' | 'ja'

// Translation messages type
type Messages = Record<string, string | Record<string, string>>

// Context type
interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string>) => string
}

// Load messages for a locale
const loadMessages = async (locale: Locale): Promise<Messages> => {
  try {
    const messages = await import(`@/messages/${locale}.json`)
    return messages.default
  } catch {
    console.warn(`Failed to load messages for locale: ${locale}`)
    return {}
  }
}

// Flatten nested messages object
const flattenMessages = (messages: Messages, prefix = ''): Record<string, string> => {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(messages)) {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      result[newKey] = value
    } else if (typeof value === 'object') {
      Object.assign(result, flattenMessages(value, newKey))
    }
  }

  return result
}

// Create context
const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Provider component
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh')
  const [messages, setMessages] = useState<Record<string, string>>({})

  useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && ['zh', 'en', 'ja'].includes(savedLocale)) {
      setLocaleState(savedLocale)
    }
  }, [])

  useEffect(() => {
    // Load messages when locale changes
    loadMessages(locale).then((msgs) => {
      setMessages(flattenMessages(msgs))
    })
    // Save locale to localStorage
    localStorage.setItem('locale', locale)
    // Update document lang attribute
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale
  }, [locale])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
  }

  const t = (key: string, params?: Record<string, string>): string => {
    let text = messages[key] || key

    // Replace placeholders like {name} with actual values
    if (params) {
      for (const [param, value] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), value)
      }
    }

    return text
  }

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
}

// Hook to use i18n
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Hook for just translation function
export function useTranslation() {
  const { t, locale } = useI18n()
  return { t, locale }
}

export default I18nProvider
