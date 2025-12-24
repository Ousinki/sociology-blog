'use client'

import Link from './Link'
import { useTranslation } from '@/lib/i18n'

interface NavLink {
  href: string
  title: string
}

interface NavLinksProps {
  links: NavLink[]
  className?: string
}

export default function NavLinks({ links, className = '' }: NavLinksProps) {
  const { t } = useTranslation()

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.title}
          href={link.href}
          className={`hover:text-primary-500 dark:hover:text-primary-400 hidden font-medium text-gray-900 sm:block dark:text-gray-100 ${className}`}
        >
          {t(`nav.${link.title.toLowerCase()}`) || link.title}
        </Link>
      ))}
    </>
  )
}
