'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'

interface Shortcut {
  key: string
  description: string
  action?: () => void
}

const shortcuts: Shortcut[] = [
  { key: '/', description: 'shortcuts.search' },
  { key: 't', description: 'shortcuts.toggleTheme' },
  { key: 'h', description: 'shortcuts.goHome' },
  { key: 'b', description: 'shortcuts.goBlog' },
  { key: '?', description: 'shortcuts.showHelp' },
  { key: 'Esc', description: 'shortcuts.closePanel' },
]

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }

      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('shortcuts.title') || 'Keyboard Shortcuts'}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between py-1">
              <span className="text-gray-600 dark:text-gray-300">
                {t(shortcut.description) || shortcut.description}
              </span>
              <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
