import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Headset,
  Leaf,
  Lightbulb,
  MapPin,
  MessageSquare,
  Phone,
  Wrench,
  Zap
} from 'lucide-react'
import { getProductBySlug, getRelatedProducts } from '@/lib/products'
import { STORE_BRAND, ECOSHIFT_PATTERN } from '@/lib/store'
import { CONTACT } from '@/lib/branches'
import { btnAmber, btnGhostDark, panelGreen } from '@/lib/ui'
import ProductCard from '@/components/ProductCard'
import Breadcrumbs from '@/components/Breadcrumbs'
import AddToQuoteButton from '@/components/AddToQuoteButton'
import ProductGallery from '@/components/ProductGallery'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoshiftcorp.com'

interface Props {
  params: Promise<{ slug: string }>
}

// Main image first, then gallery images, no duplicates, empty values removed
function collectImages(product: { mainImage?: string; galleryImages?: string[] }): string[] {
  return Array.from(new Set([product.mainImage, ...(product.galleryImages ?? [])].filter((x): x is string => Boolean(x))))
}

function getOgImages(product: { seo?: { ogImage?: string }; mainImage?: string; galleryImages?: string[] }) {
  const imgs = [product.seo?.ogImage, ...collectImages(product)].filter((x): x is string => Boolean(x))
  const unique = Array.from(new Set(imgs)).slice(0, 4)
  return unique.length ? unique.map(url => ({ url })) : undefined
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: product.seo?.title || product.name,
    description: product.seo?.description || product.itemDescription,
    alternates: { canonical: `${siteUrl}/products/${slug}` },
    openGraph: {
      title: product.seo?.title || product.name,
      description: product.seo?.description || product.itemDescription,
      url: `${siteUrl}/products/${slug}`,
      images: getOgImages(product)
    }
  }
}

const assurances = [
  { Icon: MapPin, title: 'Nationwide support', text: 'Branches and warehouses in Luzon, Visayas, and Mindanao.' },
  { Icon: Wrench, title: 'Design to installation', text: 'Dialux simulation, project management, and in-house installation.' },
  { Icon: Headset, title: 'After-sales service', text: 'Our team stays with you after delivery.' }
]

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const relatedProducts = await getRelatedProducts(product.productFamily, product.id, 4)

  const allImages = collectImages(product)
  const hasPrice = product.regularPrice > 0

  // Storefront is Ecoshift-only: show only the Ecoshift item code, never other brands'.
  const ecoCode =
    Object.entries(product.itemCodes).find(([b]) => ECOSHIFT_PATTERN.test(b))?.[1] || product.itemCode

  // Up to 4 short, scannable specs for the "at a glance" block
  const quickSpecs = product.technicalSpecs
    .flatMap(g => g.specs)
    .filter(s => s.name && s.value && String(s.value).length <= 28)
    .slice(0, 4)

  const intro = product.shortDescription || product.itemDescription
  const hasOverview = Boolean(product.itemDescription)
  const hasUsage = product.productUsage.length > 0
  const hasSpecs = product.technicalSpecs.length > 0
  const hasRelated = relatedProducts.length > 0

  const sections = [
    hasOverview && { id: 'overview', label: 'Overview' },
    hasUsage && { id: 'applications', label: 'Applications' },
    hasSpecs && { id: 'specs', label: 'Specifications' },
    hasRelated && { id: 'related', label: 'Related' }
  ].filter(Boolean) as { id: string; label: string }[]

  const inquiryHref = `/contact?subject=${encodeURIComponent(`Inquiry: ${product.name}`)}`

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: product.name }
  ]

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.itemDescription || product.shortDescription,
    image: allImages.length ? allImages : undefined,
    sku: ecoCode,
    brand: { '@type': 'Brand', name: STORE_BRAND },
    offers: hasPrice
      ? {
          '@type': 'Offer',
          price: product.regularPrice,
          priceCurrency: 'PHP',
          url: `${siteUrl}/products/${slug}`
        }
      : undefined
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <Breadcrumbs items={breadcrumbs} />

      <section className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Gallery with magnifier */}
        <div className="lg:col-span-7">
          <ProductGallery images={allImages} name={product.name} />
        </div>

        {/* Info — stays in view while the page scrolls on desktop */}
        <div className="lg:col-span-5">
          <div className="flex flex-col gap-5 lg:sticky lg:top-24">
            <div className="flex flex-wrap items-center gap-2">
              {product.productFamily && (
                <Link
                  href={`/products?category=${encodeURIComponent(product.productFamily)}`}
                  className="inline-flex w-fit items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 transition-colors hover:bg-brand-200"
                >
                  {product.productFamily}
                </Link>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Official {STORE_BRAND}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            {ecoCode && (
              <p className="w-fit rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-600">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Item code </span>
                <span className="font-mono font-medium text-zinc-800">{ecoCode}</span>
              </p>
            )}

            {intro && <p className="line-clamp-4 leading-relaxed text-zinc-600">{intro}</p>}

            {/* At a glance */}
            {quickSpecs.length > 0 && (
              <dl className="grid grid-cols-2 gap-2.5">
                {quickSpecs.map((s, i) => (
                  <div key={`${s.name}-${i}`} className="rounded-2xl border border-zinc-200 bg-white p-3.5">
                    <dt className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-zinc-400">
                      <Zap className="h-3 w-3 text-brand-600" aria-hidden="true" />
                      <span className="truncate">{s.name}</span>
                    </dt>
                    <dd className="mt-1 break-words text-sm font-bold text-zinc-900">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* Price + CTA */}
            <div id="quote-card" className="scroll-mt-24 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-brand-600 via-emerald-500 to-brand-400" aria-hidden="true" />
              <div className="bg-gradient-to-b from-white to-brand-50/60 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {hasPrice ? 'Price' : 'Pricing'}
                </p>
                <div className="mt-1">
                  {hasPrice ? (
                    <span className="text-3xl font-extrabold tracking-tight text-zinc-900">
                      ₱{product.regularPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-brand-700">
                      <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden="true" />
                      Price on Request
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <AddToQuoteButton product={product} variant="stepper" />
                </div>

                <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                  Add this to your quote request and our team will get back to you with pricing.{' '}
                  <Link href="/quote" className="inline-flex items-center gap-0.5 font-semibold text-brand-700 hover:underline">
                    View quote <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-200/70 pt-4">
                  <Link
                    href={inquiryHref}
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 transition-colors hover:border-brand-500 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <MessageSquare className="h-4 w-4" aria-hidden="true" /> Ask a question
                  </Link>
                  <a
                    href={CONTACT.phoneHref}
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 transition-colors hover:border-brand-500 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" /> Call us
                  </a>
                </div>
              </div>
            </div>

            {/* Assurances */}
            <ul className="space-y-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
              {assurances.map(({ Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-snug">
                    <span className="block font-bold text-zinc-900">{title}</span>
                    <span className="text-zinc-600">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* In-page navigation */}
      {sections.length > 1 && (
        <nav aria-label="Product sections" className="mt-10 sm:mt-14">
          <ul className="-mx-4 flex gap-2 overflow-x-auto border-b border-zinc-200 px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            {sections.map(s => (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  className="inline-flex min-h-10 items-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-500 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Overview */}
      {hasOverview && (
        <section id="overview" className="mt-10 scroll-mt-24 sm:mt-14" aria-labelledby="overview-heading">
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Overview</p>
              <h2 id="overview-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
                About this product
              </h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-zinc-600">{product.itemDescription}</p>
            </div>

            <div className={`${panelGreen} p-6 sm:p-8 lg:col-span-2`}>
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand-300/25 blur-3xl" aria-hidden="true" />
              <Leaf className="pointer-events-none absolute -bottom-6 -right-6 h-36 w-36 text-brand-900/[0.05]" aria-hidden="true" />
              <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Why choose {STORE_BRAND}</p>
              <ul className="relative mt-4 space-y-3 text-sm text-zinc-600">
                {[
                  'Energy-efficient, durable, and future-ready',
                  'Branches and warehouses across the Philippines',
                  'Competitive B2B pricing through our quote-request system',
                  'Lighting design and installation services available'
                ].map(t => (
                  <li key={t} className="flex gap-2.5">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link href="/quote" className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline">
                Start your quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Applications */}
      {hasUsage && (
        <section id="applications" className="mt-12 scroll-mt-24 sm:mt-16" aria-labelledby="applications-heading">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Best for</p>
          <h2 id="applications-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
            Where you can use it
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {product.productUsage.map(u => (
              <li key={u} className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-900/10">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Lightbulb className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold leading-snug text-zinc-800">{u}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Technical Specs */}
      {hasSpecs && (
        <section id="specs" className="mt-12 scroll-mt-24 sm:mt-16" aria-labelledby="specs-heading">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Details</p>
          <h2 id="specs-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
            Technical specifications
          </h2>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {product.technicalSpecs.map((group, gi) => (
              <div key={gi} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
                <h3 className="flex items-center gap-2 bg-brand-600 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white">
                  <Zap className="h-4 w-4 text-brand-100" aria-hidden="true" />
                  {group.specGroup}
                </h3>
                <dl>
                  {group.specs.map((spec, si) => (
                    <div
                      key={si}
                      className={`grid grid-cols-1 gap-0.5 px-5 py-3 text-sm sm:grid-cols-5 sm:gap-4 ${si % 2 === 1 ? 'bg-zinc-50' : 'bg-white'}`}
                    >
                      <dt className="font-semibold text-zinc-800 sm:col-span-2">{spec.name}</dt>
                      <dd className="break-words text-zinc-600 sm:col-span-3">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {hasRelated && (
        <section id="related" className="mt-14 scroll-mt-24 sm:mt-20" aria-labelledby="related-heading">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Keep exploring</p>
              <h2 id="related-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
                Related products
              </h2>
            </div>
            {product.productFamily && (
              <Link
                href={`/products?category=${encodeURIComponent(product.productFamily)}`}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
              >
                View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map(p => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Lead CTA */}
      <section className="mt-14 sm:mt-20" aria-labelledby="product-cta">
        <div className={`${panelGreen} px-6 py-12 text-center sm:px-12 sm:py-14`}>
          <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-[36rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-300/25 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <ClipboardList className="mx-auto h-8 w-8 text-brand-600" aria-hidden="true" />
            <h2 id="product-cta" className="mt-3 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
              Planning a project or bulk order?
            </h2>
            <p className="mt-3 text-zinc-600">
              Tell us your requirements. Our team can recommend the right lighting, prepare a Dialux design, and send a quote.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/quote" className={btnAmber}>Request a Quote <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href={inquiryHref} className={btnGhostDark}>Talk to Our Team</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-zinc-500">{product.name}</p>
            <p className="text-sm font-extrabold text-zinc-900">
              {hasPrice ? `₱${product.regularPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : 'Price on Request'}
            </p>
          </div>
          <a
            href="#quote-card"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-brand-600 px-5 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Add to quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  )
}