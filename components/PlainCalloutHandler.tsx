'use client'

import { useEffect } from 'react'

export default function PlainCalloutHandler() {
  useEffect(() => {
    const handleCalloutClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const title = target.closest('.callout-title')
      if (!title) return
      
      const callout = title.closest('.collapsible-callout, .directive-callout')
      if (!callout) return
      
      if (!callout.classList.contains('is-collapsible')) return
      
      callout.classList.toggle('is-collapsed')
    }

    document.addEventListener('click', handleCalloutClick)
    return () => document.removeEventListener('click', handleCalloutClick)
  }, [])

  return null
}
