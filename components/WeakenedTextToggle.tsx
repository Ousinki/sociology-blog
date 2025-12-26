'use client'

import { useEffect, useState } from 'react'

export default function WeakenedTextToggle() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Mark component as mounted
    setMounted(true)

    // Read initial state from localStorage AFTER mounting
    // This avoids hydration mismatch
    const savedInvisibleState = localStorage.getItem('weakenedInvisible')
    const isInvisible = savedInvisibleState === 'true'

    // Apply initial state after a small delay to avoid hydration issues
    requestAnimationFrame(() => {
      const weakenedElements = document.querySelectorAll('[data-weakened="true"]')
      weakenedElements.forEach((element) => {
        if (isInvisible) {
          element.classList.add('invisible-weakened')
        }
      })
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement

      // Don't trigger if user is typing in input fields
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Press 'e' to toggle invisible mode (preserves space)
      if (e.key === 'e' && !e.shiftKey) {
        e.preventDefault()
        toggleInvisible()
      }
    }

    const toggleInvisible = () => {
      const weakenedElements = document.querySelectorAll('[data-weakened="true"]')
      const isCurrentlyInvisible = weakenedElements[0]?.classList.contains('invisible-weakened')

      weakenedElements.forEach((element) => {
        if (isCurrentlyInvisible) {
          element.classList.remove('invisible-weakened')
        } else {
          element.classList.add('invisible-weakened')
        }
      })

      // Save state to localStorage
      localStorage.setItem('weakenedInvisible', (!isCurrentlyInvisible).toString())
      console.log('弱化文本已' + (isCurrentlyInvisible ? '显示' : '隐藏'))
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return null
}
