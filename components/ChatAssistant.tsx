'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

declare global {
  interface Window {
    toggleChatAssistant?: () => void
    isChatOpen?: boolean
    isShortcutsOpen?: boolean
  }
}

// Check if CSS Custom Highlight API is supported
const isHighlightSupported =
  typeof window !== 'undefined' && 'Highlight' in window && CSS.highlights

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selectionRangeRef = useRef<Range | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Update highlight based on focus state
  const updateHighlight = useCallback(
    (focused: boolean) => {
      if (!isHighlightSupported || !selectionRangeRef.current) return

      // Clear both highlights first
      CSS.highlights.delete('chat-selection-active')
      CSS.highlights.delete('chat-selection-inactive')

      // Create appropriate highlight based on focus state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const HighlightConstructor = (window as any).Highlight
      const highlight = new HighlightConstructor(selectionRangeRef.current)

      if (focused) {
        // Input is focused -> gray highlight
        CSS.highlights.set('chat-selection-inactive', highlight)
      } else {
        // Input not focused -> blue highlight
        CSS.highlights.set('chat-selection-active', highlight)
      }
    },
    [selectionRangeRef]
  )

  // Handle text selection - only use custom highlight when chat is already open
  // Track if we're in the middle of selecting text
  const isSelectingRef = useRef(false)

  useEffect(() => {
    // Use mousedown to clear highlights BEFORE blur event fires
    const handleMouseDown = (e: MouseEvent) => {
      // Only process if chat is open
      if (!isOpen) return

      // Ignore clicks inside the chat assistant
      if (chatContainerRef.current && chatContainerRef.current.contains(e.target as Node)) {
        return
      }

      // Mark that we're selecting text - prevent width change during selection
      isSelectingRef.current = true

      // Clear highlights immediately on mousedown (before blur)
      // This prevents the gray -> blue -> disappear flash
      if (selectionRangeRef.current) {
        selectionRangeRef.current = null
        if (isHighlightSupported) {
          CSS.highlights.delete('chat-selection-active')
          CSS.highlights.delete('chat-selection-inactive')
        }
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      // Only process if chat is already open (activated by ⌘I)
      if (!isOpen) return

      // Ignore clicks inside the chat assistant
      if (chatContainerRef.current && chatContainerRef.current.contains(e.target as Node)) {
        return
      }

      const selection = window.getSelection()
      const text = selection?.toString().trim()

      if (text && text.length > 0 && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)

        // Check if selection is inside the chat container - ignore if so
        if (
          chatContainerRef.current &&
          chatContainerRef.current.contains(range.commonAncestorContainer)
        ) {
          return
        }

        // Store the selection range using cloneRange (not cloneNode)
        const clonedRange = range.cloneRange()
        selectionRangeRef.current = clonedRange

        setSelectedText(text)

        // Auto-copy to clipboard
        navigator.clipboard.writeText(text).catch((err) => {
          console.error('Failed to copy text:', err)
        })

        // Create blue highlight immediately
        if (isHighlightSupported) {
          CSS.highlights.delete('chat-selection-active')
          CSS.highlights.delete('chat-selection-inactive')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const HighlightConstructor = (window as any).Highlight
          const highlight = new HighlightConstructor(clonedRange)
          CSS.highlights.set('chat-selection-active', highlight)
          // Clear native browser selection to avoid double highlight
          selection.removeAllRanges()
        }

        // Focus input after a delay
        setTimeout(() => {
          inputRef.current?.focus()
          setIsFocused(true)
          // Switch to gray highlight when focused
          updateHighlight(true)
        }, 200)
      } else {
        // No text selected - clear selected text state
        setSelectedText('')
        // If input is empty, also blur/shrink the chat window
        // This handles the case where we clicked outside (isSelecting=true blocked blur)
        // but didn't actually select text
        if (!inputRef.current?.value) {
          setIsFocused(false)
        }
      }

      // Reset selecting flag after a short delay
      setTimeout(() => {
        isSelectingRef.current = false
      }, 50)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [updateHighlight, isOpen])

  // Poll for shortcuts panel state
  useEffect(() => {
    const interval = setInterval(() => {
      const isShortcuts = typeof window !== 'undefined' && window.isShortcutsOpen === true
      setShortcutsOpen(isShortcuts)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          inputRef.current?.focus()
          setIsFocused(true)
        }, 100)
      })
    }
  }, [isOpen])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
    if (!isOpen) {
      setShowChat(false)
      setIsFocused(false)
      setSelectedText('')
      // Clear highlights when closing
      selectionRangeRef.current = null
      if (isHighlightSupported) {
        CSS.highlights.delete('chat-selection-active')
        CSS.highlights.delete('chat-selection-inactive')
      }
    }
  }, [isOpen])

  useEffect(() => {
    window.toggleChatAssistant = toggle
    window.isChatOpen = isOpen
    return () => {
      delete window.toggleChatAssistant
      delete window.isChatOpen
    }
  }, [toggle, isOpen])

  const clearSelectedText = () => {
    setSelectedText('')
    selectionRangeRef.current = null
    if (isHighlightSupported) {
      CSS.highlights.delete('chat-selection-active')
      CSS.highlights.delete('chat-selection-inactive')
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    // Include selected text context if available
    let messageContent = input.trim()
    if (selectedText) {
      messageContent = `关于以下文本：\n"${selectedText}"\n\n${messageContent}`
      setSelectedText('') // Clear after sending
    }

    const userMessage: Message = { role: 'user', content: messageContent }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setShowChat(true)

    if (inputRef.current) {
      inputRef.current.style.height = '68px'
    }

    const storedModel = localStorage.getItem('chatModel') || 'openai'

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          provider: storedModel,
        }),
      })

      if (!response.ok) throw new Error('Failed')

      const data = await response.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.content }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，发生了错误。请检查 API 配置。' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') setIsOpen(false)
  }

  if (!isOpen || shortcutsOpen) return null

  const hasInput = input.trim().length > 0

  return (
    <div className="pointer-events-none fixed right-0 bottom-6 left-0 z-60 flex justify-center px-4">
      <div
        ref={chatContainerRef}
        className="pointer-events-auto w-full transition-[max-width] duration-300 ease-out"
        style={{ maxWidth: isFocused ? '30rem' : '24rem' }}
      >
        {/* Messages */}
        {showChat && messages.length > 0 && (
          <div className="mb-2 max-h-48 overflow-y-auto rounded-lg bg-white/95 p-3 shadow-md backdrop-blur dark:bg-gray-800/95">
            <div className="space-y-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`text-sm ${msg.role === 'user' ? 'text-right text-gray-600' : 'text-left text-gray-800 dark:text-gray-200'}`}
                >
                  {msg.content}
                </div>
              ))}
              {isLoading && <div className="text-sm text-gray-400">思考中...</div>}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input Bar with Selected Text Badge */}
        <div className="rounded-xl bg-gray-100 shadow-sm dark:bg-gray-800">
          {/* Selected Text Badge inside dialog */}
          {selectedText && (
            <div className="flex items-center gap-2 border-b border-gray-200 px-3.5 py-2 dark:border-gray-700">
              <span className="flex items-center gap-1.5 rounded-md bg-blue-600 px-2 py-1 text-xs text-white">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                已选文本
              </span>
              <span className="line-clamp-1 flex-1 text-xs text-gray-600 dark:text-gray-400">
                {selectedText.slice(0, 50)}
                {selectedText.length > 50 && '...'}
              </span>
              <button
                onClick={clearSelectedText}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="flex items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = '68px'
                const newHeight = Math.max(68, Math.min(e.target.scrollHeight, 200))
                e.target.style.height = newHeight + 'px'
              }}
              onFocus={() => {
                setIsFocused(true)
                updateHighlight(true) // Switch to gray when focused
              }}
              onBlur={() => {
                // Don't change isFocused if we're in the middle of selecting text
                if (!input && !isSelectingRef.current) setIsFocused(false)
                // Delay to allow mouseup to clear highlights first
                setTimeout(() => {
                  // Only switch to blue if we still have a selection
                  if (selectionRangeRef.current) {
                    updateHighlight(false)
                  }
                }, 10)
              }}
              onKeyDown={handleKeyDown}
              placeholder={selectedText ? '基于选中文本提问...' : '提出问题...'}
              rows={1}
              className="w-full min-w-0 flex-1 resize-none border-0 bg-transparent py-2.5 pr-2 pl-3.5 text-sm text-gray-900 placeholder-gray-500 !ring-0 !outline-none focus:!border-0 focus:!ring-0 focus:!outline-none dark:text-gray-100 dark:placeholder-gray-400"
              style={{ resize: 'none', minHeight: '68px', maxHeight: '200px', fontSize: '14px' }}
            />

            {/* ⌘I indicator - hidden when focused */}
            {!isFocused && <span className="mb-3.5 text-sm text-gray-400">⌘I</span>}

            {/* Send Button - grey default, blue when has input */}
            <button
              onClick={() => handleSubmit()}
              disabled={!hasInput || isLoading}
              className={`m-1.5 mb-2 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-colors ${
                hasInput ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'
              } disabled:opacity-60`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
