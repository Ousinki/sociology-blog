'use client'

import { useTranslation } from '@/lib/i18n'

interface TranslatedTextProps {
  id: string
  fallback?: string
  params?: Record<string, string>
}

export default function TranslatedText({ id, fallback, params }: TranslatedTextProps) {
  const { t } = useTranslation()
  const text = t(id, params)

  // If translation not found, use fallback or the key itself
  return <>{text === id && fallback ? fallback : text}</>
}
