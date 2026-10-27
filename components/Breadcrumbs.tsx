import Link from 'next/link'
import type { BreadcrumbItem } from '@/lib/types'

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: item.href } : {})
    }))
  }

  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden="true" className="text-zinc-400">/</span>
              )}
              {item.href && i < items.length - 1 ? (
                <Link href={item.href} className="transition-colors hover:text-brand-700">
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-ink" aria-current={i === items.length - 1 ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  )
}
