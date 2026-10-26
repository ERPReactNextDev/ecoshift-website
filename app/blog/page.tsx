import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Leaf, Lightbulb, Sun } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import Reveal from '@/components/Reveal'
import PageHero, { Glow } from '@/components/PageHero'
import { blogPosts } from '@/lib/blog-data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoshiftcorp.com'
export const metadata: Metadata = {
  title: 'Blog',
  description: 'Insights and guides on energy-efficient lighting, LED retrofits, smart lighting controls, and best practices.',
  alternates: { canonical: `${siteUrl}/blog` }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const icons = [Lightbulb, Sun, Leaf]

export default function BlogPage() {
  const [featured, ...rest] = blogPosts

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />

      <PageHero
        eyebrow="Ecoshift Insights"
        title={<>Ideas for <Glow>smarter, greener</Glow> lighting</>}
        description="Guides on LED retrofits, solar lighting, and energy-saving best practices from the Ecoshift team."
        compact
      />

      {featured && (
        <section className="mt-12 sm:mt-16" aria-label="Featured article">
          <Reveal>
            <Link
              href={`/blog/${featured.slug}`}
              className="group relative grid overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/10 md:grid-cols-5"
            >
              <div className="relative flex min-h-48 items-center justify-center bg-gradient-to-br from-brand-600 to-emerald-500 md:col-span-2">
                <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-300/25 blur-3xl" aria-hidden="true" />
                <Sun className="relative h-20 w-20 text-white/90 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" aria-hidden="true" />
              </div>
              <div className="p-6 sm:p-8 md:col-span-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Latest article · {formatDate(featured.publishedAt)}</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-900 transition-colors group-hover:text-brand-700 sm:text-3xl">{featured.title}</h2>
                <p className="mt-3 text-zinc-600">{featured.excerpt}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {featured.tags.map(tag => (
                    <span key={tag} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{tag}</span>
                  ))}
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                  Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {rest.length > 0 && (
        <section className="mt-10" aria-label="More articles">
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => {
              const Icon = icons[i % icons.length]
              return (
                <li key={post.slug}>
                  <Reveal delay={(i % 3) * 80} className="h-full">
                    <article className="group relative h-full overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/10">
                      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-brand-100 via-brand-50 to-emerald-100">
                        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-brand-300/25 blur-2xl" aria-hidden="true" />
                        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#16a34a_1px,transparent_1px)] [background-size:18px_18px]" aria-hidden="true" />
                        <Icon className="relative h-12 w-12 text-brand-600 transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />
                      </div>
                      <div className="p-5 sm:p-6">
                        <p className="text-xs font-medium text-zinc-500">{formatDate(post.publishedAt)}</p>
                        <h2 className="mt-1.5 text-lg font-bold leading-snug text-zinc-900 transition-colors group-hover:text-brand-700">
                          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                            {post.title}
                          </Link>
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-600">{post.excerpt}</p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {post.tags.map(tag => (
                            <span key={tag} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {blogPosts.length === 0 && (
        <div className="mt-12 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 py-14 text-center text-zinc-500">
          Articles are coming soon.
        </div>
      )}
    </div>
  )
}
