import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { BreadcrumbItem } from '@/lib/types'

interface Props {
  items: BreadcrumbItem[]
}

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoshiftcorp.com').replace(/\/$/, '')

// JSON-LD wants absolute URLs
function absolute(href: string) {
  return /^https?:\/\//.test(href) ? href : `${siteUrl}${href.startsWith('/') ? '' : '/'}${href}`
}

export default function Breadcrumbs({ items }: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absolute(item.href) } : {})
    }))
  }

  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-y-1 text-sm">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <li key={index} className="flex min-w-0 items-center">
                {index > 0 && (
                  <ChevronRight className="mx-1.5 h-3.5 w-3.5 shrink-0 text-zinc-300" aria-hidden="true" />
                )}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="rounded-md px-1.5 py-0.5 font-medium text-zinc-500 transition-colors hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="max-w-[16rem] truncate rounded-md bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-900 sm:max-w-md"
                    aria-current={isLast ? 'page' : undefined}
                    title={item.label}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  )
}