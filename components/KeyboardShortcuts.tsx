'use client'

import { useState, useEffect, useRef } from 'react'

const shortcuts = [
  { key: 'gg', description: 'Go to top' },
  { key: 'G', description: 'Go to bottom' },
  { key: 'e', description: 'Toggle weakened text' },
  { key: 'Space', description: 'Toggle shortcuts' },
]

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)
  const lastKeyRef = useRef<string>('')
  const lastKeyTimeRef = useRef<number>(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const now = Date.now()

      // Handle 'gg' - scroll to top
      if (e.key === 'g') {
        if (lastKeyRef.current === 'g' && now - lastKeyTimeRef.current < 500) {
          e.preventDefault()
          window.scrollTo({ top: 0, behavior: 'smooth' })
          lastKeyRef.current = ''
        } else {
          lastKeyRef.current = 'g'
          lastKeyTimeRef.current = now
        }
        return
      }

      // Handle 'G' - scroll to bottom
      if (e.key === 'G' && e.shiftKey) {
        e.preventDefault()
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        lastKeyRef.current = ''
        return
      }

      // Handle Space - toggle shortcuts panel
      if (e.key === ' ' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        lastKeyRef.current = ''
        return
      }

      // Handle Escape - close panel
      if (e.key === 'Escape') {
        setIsOpen(false)
        lastKeyRef.current = ''
        return
      }

      // Reset last key for other keys
      lastKeyRef.current = ''
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) return null

  return (
    <div
      role="button"
      tabIndex={0}
      className="animate-slide-up fixed right-0 bottom-0 left-0 z-50"
      onClick={() => setIsOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        role="dialog"
        aria-modal="true"
        className="mx-auto max-w-2xl rounded-t-2xl bg-white/95 p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] backdrop-blur-sm dark:bg-gray-800/95 dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
          ⌨️ Keyboard Shortcuts
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50"
            >
              <kbd className="rounded bg-gray-200 px-2 py-0.5 font-mono text-xs font-medium text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                {shortcut.key}
              </kbd>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                {shortcut.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
