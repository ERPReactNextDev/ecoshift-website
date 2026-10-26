import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, ChevronDown, Search, SearchX, SlidersHorizontal, X } from 'lucide-react'
import { getProducts, extractCategories, extractBrands } from '@/lib/products'
import { STORE_BRAND, resolveStoreBrand } from '@/lib/store'
import ProductCard from '@/components/ProductCard'
import Breadcrumbs from '@/components/Breadcrumbs'
import { btnAmber, btnGhostDark, panelGreen } from '@/lib/ui'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoshiftcorp.com'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse the full range of Ecoshift energy-efficient LED and solar lighting products. Filter by category or search by name, then request a quote.',
  alternates: { canonical: `${siteUrl}/products` },
  openGraph: { title: 'Products | Ecoshift Corporation', url: `${siteUrl}/products` }
}

const PER_PAGE = 24

interface Props {
  // `brand` is intentionally not read: the catalog is always locked to Ecoshift.
  searchParams: Promise<{ category?: string; search?: string; page?: string }>
}

// 1 … 4 5 [6] 7 8 … 20  — keeps pagination short on any screen
function getPageItems(current: number, total: number): (number | 'gap')[] {
  const wanted = new Set([1, total, current - 1, current, current + 1])
  const pages = Array.from(wanted).filter(p => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push('gap')
    out.push(p)
  })
  return out
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const category = params.category ?? ''
  const search = params.search ?? ''
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  // 1) Look up the exact brand string stored in the data (handles "ECOSHIFT", "Eco Shift", ...)
  const everything = await getProducts({ perPage: 9999 })
  const ecoBrand = resolveStoreBrand(extractBrands(everything.products))

  // 2) Locked to Ecoshift. If no Ecoshift brand exists in the data, don't filter (never show an empty catalog).
  const [{ products, total }, brandResult] = await Promise.all([
    getProducts({ productFamily: category || undefined, brand: ecoBrand, search: search || undefined, page, perPage: PER_PAGE }),
    ecoBrand ? getProducts({ brand: ecoBrand, perPage: 9999 }) : Promise.resolve(everything)
  ])

  // Categories come only from Ecoshift products, so empty categories never show up
  const categories = extractCategories(brandResult.products)
  const totalPages = Math.ceil(total / PER_PAGE)

  const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Products' }]

  function buildUrl(p: { page?: string | null; category?: string | null; search?: string | null }) {
    const qs = new URLSearchParams()
    const cat = p.category !== undefined ? p.category : category
    const sr = p.search !== undefined ? p.search : search
    const pg = p.page ?? null
    if (cat) qs.set('category', cat)
    if (sr) qs.set('search', sr)
    if (pg && pg !== '1') qs.set('page', pg)
    return `/products${qs.toString() ? '?' + qs.toString() : ''}`
  }

  const hasFilters = Boolean(category || search)
  const pageBtn =
    'inline-flex h-11 min-w-11 items-center justify-center rounded-xl px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'

  const categoryItems = [{ label: 'All products', value: '' }, ...categories.map(c => ({ label: c, value: c }))]

  // Shared category list (used by the mobile drawer and the desktop sidebar)
  const categoryList = (
    <ul className="flex flex-col gap-0.5">
      {categoryItems.map(c => {
        const active = category === c.value
        return (
          <li key={c.label}>
            <Link
              href={buildUrl({ category: c.value, page: null })}
              aria-current={active ? 'true' : undefined}
              className={`flex min-h-10 items-center rounded-lg px-3 text-sm capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                active
                  ? 'bg-brand-600 font-semibold text-white'
                  : 'text-zinc-700 hover:bg-brand-50 hover:text-brand-800'
              }`}
            >
              <span className="truncate">{c.label.toLowerCase()}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Slim header: title + centered search (Shopee-style) */}
      <section className={`${panelGreen} mt-4 px-4 py-5 sm:px-10 sm:py-8`}>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
            {STORE_BRAND} LED and solar lighting
          </h1>
          <p className="mt-1 hidden text-sm text-zinc-600 sm:block">Find what you need, add it to your quote, and our team will send pricing.</p>

          <form method="GET" action="/products" role="search" className="mt-4 flex items-center gap-2">
            {category && <input type="hidden" name="category" value={category} />}
            <div className="relative flex-1">
              <label htmlFor="search" className="sr-only">Search products</label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <input
                id="search"
                type="search"
                name="search"
                placeholder="Search by product name or item code…"
                defaultValue={search}
                className="h-12 w-full rounded-full border-0 bg-white pl-11 pr-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              aria-label="Search"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-brand-600 px-5 text-sm font-bold text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:px-8"
            >
              <Search className="h-5 w-5 sm:hidden" aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>
      </section>

      {/* Mobile / tablet: collapsible filter. Hidden on desktop (sidebar is used instead). */}
      {categories.length > 0 && (
        <details className="group mt-4 rounded-2xl border border-zinc-200 bg-white lg:hidden">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-zinc-800 [&::-webkit-details-marker]:hidden">
            <span className="flex min-w-0 items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
              <span>Categories</span>
              {category && (
                <span className="truncate rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium capitalize text-brand-800">
                  {category.toLowerCase()}
                </span>
              )}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="max-h-72 overflow-y-auto border-t border-zinc-100 p-2">{categoryList}</div>
        </details>
      )}

      <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-8">
        {/* Main column */}
        <div className="min-w-0">
          {/* Result summary + active filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500" aria-live="polite">
              {total === 0
                ? 'No products found.'
                : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, total)} of ${total} product${total !== 1 ? 's' : ''}`}
            </p>

            {hasFilters && (
              <ul className="flex flex-wrap items-center gap-2">
                {category && (
                  <li><FilterChip label={category} href={buildUrl({ category: '', page: null })} /></li>
                )}
                {search && (
                  <li><FilterChip label={`“${search}”`} href={buildUrl({ search: '', page: null })} /></li>
                )}
                <li>
                  <Link href="/products" className="px-1 text-sm font-semibold text-brand-700 hover:underline">
                    Clear all
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Grid: 2 columns on phones, like a marketplace */}
          {products.length > 0 ? (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {products.map(product => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-zinc-400 shadow-sm">
                <SearchX className="h-7 w-7" aria-hidden="true" />
              </span>
              <p className="mt-4 text-lg font-bold text-zinc-900">No products match your filters</p>
              <p className="mt-1 max-w-sm text-sm text-zinc-500">Try a different keyword, or remove a filter to see more of the catalog.</p>
              <Link
                href="/products"
                className="mt-6 inline-flex min-h-11 items-center rounded-full bg-brand-600 px-6 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-colors hover:bg-brand-700"
              >
                Clear filters
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Product page navigation">
              {page > 1 ? (
                <Link href={buildUrl({ page: String(page - 1) })} className={`${pageBtn} gap-1 border border-zinc-200 bg-white text-zinc-700 hover:border-brand-500 hover:text-brand-700`} aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Prev</span>
                </Link>
              ) : (
                <span className={`${pageBtn} gap-1 border border-zinc-100 text-zinc-300`} aria-hidden="true">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Prev</span>
                </span>
              )}

              {/* Phones: just "Page x of y" */}
              <span className="px-3 text-sm font-semibold text-zinc-600 sm:hidden">
                Page {page} of {totalPages}
              </span>

              {/* Tablet/desktop: windowed page numbers */}
              <ul className="hidden items-center gap-1 sm:flex">
                {getPageItems(page, totalPages).map((p, i) =>
                  p === 'gap' ? (
                    <li key={`gap-${i}`} className="px-1 text-zinc-400" aria-hidden="true">…</li>
                  ) : (
                    <li key={p}>
                      <Link
                        href={buildUrl({ page: p === 1 ? null : String(p) })}
                        aria-current={page === p ? 'page' : undefined}
                        className={`${pageBtn} ${page === p ? 'pointer-events-none bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'text-zinc-700 hover:bg-zinc-100'}`}
                      >
                        {p}
                      </Link>
                    </li>
                  )
                )}
              </ul>

              {page < totalPages ? (
                <Link href={buildUrl({ page: String(page + 1) })} className={`${pageBtn} gap-1 border border-zinc-200 bg-white text-zinc-700 hover:border-brand-500 hover:text-brand-700`} aria-label="Next page">
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <span className={`${pageBtn} gap-1 border border-zinc-100 text-zinc-300`} aria-hidden="true">
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </nav>
          )}
        </div>

        {/* Desktop: filter sidebar on the RIGHT. Scrolls on its own, so any number of categories stays tidy. */}
        {categories.length > 0 && (
          <aside className="hidden lg:block" aria-label="Product filters">
            <nav
              aria-label="Product categories"
              className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-3"
            >
              <p className="px-3 pb-2 pt-1 text-sm font-bold text-zinc-900">Categories</p>
              {categoryList}
            </nav>
          </aside>
        )}
      </div>

      {/* Lead CTA */}
      <section className="mt-14 sm:mt-20" aria-labelledby="catalog-cta">
        <div className={`${panelGreen} px-6 py-10 text-center sm:px-12 sm:py-14`}>
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-[32rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-300/30 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <h2 id="catalog-cta" className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">Can&rsquo;t find what you need?</h2>
            <p className="mt-3 text-zinc-600">Tell us about your project. Our team can recommend the right LED or solar lighting and prepare a quote.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/contact" className={btnAmber}>Talk to Our Team <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href="/quote" className={btnGhostDark}>View My Quote</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FilterChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      aria-label={`Remove filter ${label}`}
      className="inline-flex min-h-9 max-w-[14rem] items-center gap-1.5 rounded-full bg-brand-50 px-3 text-sm font-medium capitalize text-brand-800 transition-colors hover:bg-brand-100"
    >
      <span className="truncate">{label.toLowerCase()}</span>
      <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    </Link>
  )
}