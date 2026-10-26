import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BatteryCharging,
  CalendarDays,
  ClipboardList,
  Headset,
  Leaf,
  Lightbulb,
  MapPin,
  Recycle,
  ShieldCheck,
  Sun,
  Wrench,
  Zap
} from 'lucide-react'
import { getFeaturedProducts, getProducts, extractCategories } from '@/lib/products'
import { blogPosts } from '@/lib/blog-data'
import ProductCard from '@/components/ProductCard'
import HomeCategoryTabs from '@/components/HomeCategoryTabs'
import HeroBanner from '@/components/HeroBanner'
import ClientsSection from '@/components/ClientSection'
import Reveal from '@/components/Reveal'
import { eyebrow, h2, btnAmber, btnGhostDark, panelGreen, panelEyebrow, panelH2, panelCard } from '@/lib/ui'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoshiftcorp.com'

export const metadata: Metadata = {
  alternates: { canonical: siteUrl },
  openGraph: { url: siteUrl }
}

const perks = [
  { Icon: ClipboardList, title: 'Quote in minutes', text: 'Build a request and we send pricing' },
  { Icon: MapPin, title: 'Nationwide branches', text: 'Luzon, Visayas, and Mindanao' },
  { Icon: Wrench, title: 'Installation support', text: 'In-house technical team' },
  { Icon: Headset, title: 'After-sales service', text: 'We stay with you after delivery' }
]

const lines = [
  {
    Icon: Lightbulb,
    tag: 'LED Lighting',
    title: 'Bright light, small energy bill',
    text: 'Energy-efficient LED fixtures, bulbs, and electrical components for offices, warehouses, retail, and public spaces.',
    points: ['Low power consumption', 'Long service life', 'Indoor and outdoor ranges'],
    featured: true
  },
  {
    Icon: Sun,
    tag: 'Solar Lights',
    title: 'Powered by the sun, free from the grid',
    text: 'Solar-powered lighting for streets, parks, campuses, and remote sites where running cable is costly or impossible.',
    points: ['No electricity cost', 'Works off-grid', 'Easy, low-maintenance installation'],
    featured: false
  }
]

const impact = [
  { Icon: Zap, title: 'Use less energy', text: 'LED technology delivers the same light for a fraction of the power.' },
  { Icon: BatteryCharging, title: 'Harness the sun', text: 'Solar lights turn daylight into night-time safety.' },
  { Icon: Recycle, title: 'Last longer, waste less', text: 'Durable products mean fewer replacements and less waste.' },
  { Icon: ShieldCheck, title: 'Backed by service', text: 'Design, project management, and installation by our in-house team.' }
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default async function HomePage() {
  const [featuredProducts, allResult] = await Promise.all([
    getFeaturedProducts(8),
    getProducts({ perPage: 200 })
  ])
  const categories = extractCategories(allResult.products)
  const latestPosts = [...blogPosts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3)

  return (
    <>
      {/* Hero banner */}
      <HeroBanner />

      {/* Store perks */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8" aria-label="Why shop with Ecoshift">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {perks.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 sm:p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 sm:h-11 sm:w-11">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-tight text-zinc-900">{title}</span>
                <span className="mt-0.5 hidden text-xs leading-snug text-zinc-500 sm:block">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Shop by category */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8" aria-labelledby="category-heading">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className={eyebrow}>Browse</p>
                <h2 id="category-heading" className={h2}>Shop by category</h2>
              </div>
              <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
                All products <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-8">
            <HomeCategoryTabs categories={categories} />
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8" aria-labelledby="featured-heading">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={eyebrow}>Featured</p>
              <h2 id="featured-heading" className={h2}>Featured products</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
              View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
        {featuredProducts.length > 0 ? (
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((p, i) => (
              <li key={p.id}>
                <Reveal delay={(i % 4) * 80} className="h-full">
                  <ProductCard product={p} />
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 py-14 text-center text-zinc-500">
            <Sun className="mx-auto h-8 w-8 text-brand-500" aria-hidden="true" />
            <p className="mt-3">Products will appear here once configured.</p>
          </div>
        )}
      </section>

      {/* LED + Solar product lines */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8" aria-labelledby="lines-heading">
        <Reveal>
          <p className={eyebrow}>Our product lines</p>
          <h2 id="lines-heading" className={h2}>Two ways to light up a greener future</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {lines.map(({ Icon, tag, title, text, points, featured }, i) => (
            <Reveal key={tag} delay={i * 100} className="h-full">
              <div
                className={`group relative h-full overflow-hidden rounded-3xl border p-8 transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-900/10 sm:p-10 ${
                  featured
                    ? 'border-brand-200 bg-gradient-to-br from-brand-50 via-white to-emerald-50'
                    : 'border-brand-100 bg-white'
                }`}
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-300/25 blur-3xl transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
                <Icon
                  className="pointer-events-none absolute -bottom-8 -right-8 h-52 w-52 text-brand-900/[0.05]"
                  aria-hidden="true"
                />
                <span
                  className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
                    featured ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25' : 'bg-brand-50 text-brand-700'
                  }`}
                >
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">{tag}</p>
                <h3 className="relative mt-2 text-2xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-3xl">{title}</h3>
                <p className="relative mt-3 max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base">{text}</p>
                <ul className="relative mt-5 space-y-2 text-sm font-medium text-zinc-800">
                  {points.map(p => (
                    <li key={p} className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-brand-600" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/products"
                  className="relative mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline"
                >
                  Shop {tag} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Eco impact */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8" aria-labelledby="impact-heading">
        <div className={`${panelGreen} px-5 py-10 sm:px-10 sm:py-14 lg:px-14`}>
          <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-300/25 blur-3xl" aria-hidden="true" />
          <Reveal>
            <p className={`relative ${panelEyebrow}`}>Good for business, good for the planet</p>
            <h2 id="impact-heading" className={`relative max-w-2xl ${panelH2}`}>
              Lighting that <span className="text-brand-600">cares</span> for the environment
            </h2>
          </Reveal>
          <ul className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impact.map(({ Icon, title, text }, i) => (
              <li key={title}>
                <Reveal delay={i * 80} className="h-full">
                  <div className={panelCard}>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-bold text-zinc-900">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Clients */}
      <ClientsSection />

      {/* Latest blogs */}
      {latestPosts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8" aria-labelledby="blog-heading">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className={eyebrow}>From the blog</p>
                <h2 id="blog-heading" className={h2}>Latest articles</h2>
              </div>
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
                All articles <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
          <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post, i) => (
              <li key={post.slug}>
                <Reveal delay={i * 80} className="h-full">
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/10">
                    <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-brand-100 via-brand-50 to-emerald-100">
                      <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/60 blur-2xl" aria-hidden="true" />
                      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#16a34a_1px,transparent_1px)] [background-size:18px_18px]" aria-hidden="true" />
                      <Leaf className="relative h-12 w-12 text-brand-600 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" aria-hidden="true" />
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                        <CalendarDays className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                        {formatDate(post.publishedAt)}
                      </p>
                      <h3 className="mt-2 text-lg font-bold leading-snug text-zinc-900 transition-colors group-hover:text-brand-700">
                        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600">{post.excerpt}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{tag}</span>
                        ))}
                      </div>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-brand-700">
                        Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-labelledby="cta-heading">
        <Reveal>
          <div className={`${panelGreen} px-6 py-12 text-center sm:px-12 sm:py-16`}>
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-[36rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-300/30 blur-3xl" aria-hidden="true" />
            <div className="relative mx-auto max-w-3xl">
              <h2 id="cta-heading" className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                Ready to save on <span className="italic text-brand-700">energy</span>?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg">
                Build a quote request with the LED and solar products you need and our team will get back to you with pricing.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/products" className={btnAmber}>
                  Start Building Your Quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/contact" className={btnGhostDark}>Talk to Our Team</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}