'use client'

import Link from './Link'
import { useTranslation } from '@/lib/i18n'

interface SiteTitleProps {
  title: string
  href?: string
}

export default function SiteTitle({ title, href = '/' }: SiteTitleProps) {
  const { t } = useTranslation()
  const displayTitle = t('site.title') || title

  return (
    <Link href={href} aria-label={displayTitle}>
      <div className="flex items-center justify-between">
        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 mr-3 text-xl font-semibold">
          {displayTitle}
        </div>
      </div>
    </Link>
  )
}
