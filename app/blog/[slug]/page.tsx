import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarDays, Leaf, UserRound } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import { blogPosts } from '@/lib/blog-data'
import { btnAmber, btnGhostDark, panelGreen } from '@/lib/ui'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoshiftcorp.com'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find(p => p.slug === slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${siteUrl}/blog/${slug}` },
    openGraph: { title: post.title, description: post.excerpt, url: `${siteUrl}/blog/${slug}`, type: 'article', images: post.ogImage ? [{ url: post.ogImage }] : undefined }
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = blogPosts.find(p => p.slug === slug)
  if (!post) notFound()

  const related = blogPosts.filter(p => p.slug !== slug && p.tags.some(t => post.tags.includes(t))).slice(0, 3)

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Organization', name: post.author },
    datePublished: post.publishedAt,
    url: `${siteUrl}/blog/${slug}`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]} />

      {/* Article header */}
      <header className={`${panelGreen} mt-5 px-5 py-10 sm:px-10 sm:py-14 lg:px-14`}>
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-300/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#16a34a_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map(tag => (
              <span key={tag} className="rounded-full border border-brand-200 bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">{tag}</span>
            ))}
          </div>
          <h1 className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight text-brand-900 sm:text-4xl lg:text-5xl">{post.title}</h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-zinc-600">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-brand-600" aria-hidden="true" />{formatDate(post.publishedAt)}</span>
            <span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4 text-brand-600" aria-hidden="true" />{post.author}</span>
          </p>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto mt-10 max-w-3xl">
        <article
          className="prose prose-lg prose-zinc max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-brand-700 prose-a:underline-offset-4 prose-blockquote:border-brand-500 prose-img:rounded-3xl prose-li:marker:text-brand-600"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-10 border-t border-zinc-200 pt-6">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All blog posts
          </Link>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14" aria-labelledby="related-heading">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Keep reading</p>
          <h2 id="related-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">Related articles</h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {related.map(rp => (
              <li key={rp.slug}>
                <Link
                  href={`/blog/${rp.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-zinc-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/10"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Leaf className="h-5 w-5" aria-hidden="true" /></span>
                  <p className="mt-4 text-xs text-zinc-500">{formatDate(rp.publishedAt)}</p>
                  <h3 className="mt-1 font-bold leading-snug text-zinc-900 transition-colors group-hover:text-brand-700">{rp.title}</h3>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-700">
                    Read <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CTA */}
      <section className="mt-14 sm:mt-20" aria-labelledby="post-cta">
        <div className={`${panelGreen} px-6 py-10 text-center sm:px-12 sm:py-14`}>
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-[32rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-300/30 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <h2 id="post-cta" className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">Planning an LED or solar project?</h2>
            <p className="mt-3 text-zinc-600">Tell us what you need and our team will recommend the right lighting.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/quote" className={btnAmber}>Request a Quote</Link>
              <Link href="/contact" className={btnGhostDark}>Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
