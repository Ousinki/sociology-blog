'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

interface TocHeading {
  value: string
  url: string
  depth: number
}

interface TOCSidebarProps {
  toc: TocHeading[]
}

export default function TOCSidebar({ toc }: TOCSidebarProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isFixed, setIsFixed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [initialTop, setInitialTop] = useState(0)
  const { t } = useI18n()

  // 过滤掉 h1，只保留 h2 和 h3
  const filteredToc = toc?.filter((heading) => heading.depth === 2 || heading.depth === 3) || []

  useEffect(() => {
    // 获取初始位置
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setInitialTop(rect.top + window.scrollY)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      // 当滚动超过目录的初始位置时，固定目录
      if (scrollY > initialTop - 80) {
        setIsFixed(true)
      } else {
        setIsFixed(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [initialTop])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '0% 0% -80% 0%' }
    )

    const headings = document.querySelectorAll('h2, h3')
    headings.forEach((heading) => observer.observe(heading))

    return () => observer.disconnect()
  }, [])

  if (filteredToc.length === 0) {
    return null
  }

  return (
    <div ref={containerRef}>
      <div
        style={
          isFixed
            ? {
                position: 'fixed',
                top: '5rem',
                width: '200px',
                maxHeight: 'calc(100vh - 6rem)',
                overflowY: 'auto',
                backgroundColor: 'inherit',
                zIndex: 10,
              }
            : {}
        }
        className="pt-4"
      >
        <h2 className="mb-3 text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
          {t('common.tableOfContents')}
        </h2>
        <nav className="space-y-2 pr-2">
          {filteredToc.map((heading) => (
            <a
              key={heading.url}
              href={heading.url}
              onClick={(e) => {
                e.preventDefault()
                const element = document.querySelector(heading.url)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className={`block cursor-pointer text-sm transition-colors ${
                activeId === heading.url.slice(1)
                  ? 'text-primary-500 font-medium'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              } ${heading.depth === 3 ? 'pl-4' : ''}`}
            >
              {heading.value}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
