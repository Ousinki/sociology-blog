'use client'

import { useState, useEffect, useRef } from 'react'

const shortcuts = [
  { key: 'gg', description: 'Go to top' },
  { key: 'G', description: 'Go to bottom' },
  { key: 'e', description: 'Toggle weakened text' },
  { key: 's', description: 'Swap ruby text' },
  { key: 'h', description: 'Toggle ruby visibility' },
  { key: '⌘I', description: 'Open AI chat' },
  { key: 'Space', description: 'Toggle shortcuts' },
]

const chatModels = ['openai', 'claude', 'gemini', 'deepseek']

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState('openai')
  const lastKeyRef = useRef<string>('')
  const lastKeyTimeRef = useRef<number>(0)

  // Load saved model on mount
  useEffect(() => {
    const saved = localStorage.getItem('chatModel')
    if (saved && chatModels.includes(saved)) {
      setSelectedModel(saved)
    }
  }, [])

  // Expose shortcuts panel state globally
  useEffect(() => {
    window.isShortcutsOpen = isOpen
    return () => {
      delete window.isShortcutsOpen
    }
  }, [isOpen])

  // Save model when changed
  const handleModelChange = (model: string) => {
    setSelectedModel(model)
    localStorage.setItem('chatModel', model)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const now = Date.now()

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

      if (e.key === 'G' && e.shiftKey) {
        e.preventDefault()
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        lastKeyRef.current = ''
        return
      }

      // Handle ⌘I - toggle AI chat
      if (e.key === 'i' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (typeof window.toggleChatAssistant === 'function') {
          window.toggleChatAssistant()
        }
        lastKeyRef.current = ''
        return
      }

      if (e.key === ' ' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        lastKeyRef.current = ''
        return
      }

      if (e.key === 'Escape') {
        setIsOpen(false)
        lastKeyRef.current = ''
        return
      }

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

        {/* AI Model Selector */}
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              AI Chat Model
            </span>
            <select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              {chatModels.map((model) => (
                <option key={model} value={model}>
                  {model.charAt(0).toUpperCase() + model.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
