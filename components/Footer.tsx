import Link from 'next/link'
import Image from 'next/image'

const EXPLORE = [
  { label: 'All Products',    href: '/products' },
  { label: 'Request a Quote', href: '/quote' },
  { label: 'Projects',        href: '/projects' },
  { label: 'Blog',            href: '/blog' },
]

const COMPANY = [
  { label: 'About Us',     href: '/about' },
  { label: 'Our Branches', href: '/branches' },
  { label: 'Careers',      href: '/careers' },
  { label: 'Contact',      href: '/contact' },
  { label: 'Privacy',      href: '/privacy' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-rule bg-paper text-zinc-600">

      {/* ── Main grid ── */}
      <div className="container grid grid-cols-2 gap-x-8 gap-y-12 py-14 md:grid-cols-12">

        {/* Brand block */}
        <div className="col-span-2 md:col-span-4">
          {/* Logo */}
          <Link href="/" className="mb-5 inline-block" aria-label="Ecoshift Corporation">
            <Image
              src="/logo/ecoshift.png"
              alt="Ecoshift Corporation"
              width={180}
              height={48}
              className="h-11 w-auto object-contain"
            />
          </Link>

          <p className="max-w-xs text-sm leading-relaxed text-zinc-600">
            Energy-efficient lighting and electrical solutions for
            businesses and communities across the Philippines.
          </p>

          {/* Tagline */}
          <p className="mt-4 border-l-2 border-brand-600 pl-3 text-sm font-semibold text-ink leading-snug">
            Together, let&rsquo;s choose the brighter choice
            <span className="block font-normal text-zinc-500">for every Filipino, one community at a time.</span>
          </p>

          {/* Socials */}
          <div className="mt-6 flex gap-2">
            <a
              href="https://facebook.com/ecoshiftcorp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center border border-rule text-zinc-500 transition-colors hover:border-brand-600 hover:text-brand-600"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/company/ecoshiftcorp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center border border-rule text-zinc-500 transition-colors hover:border-brand-600 hover:text-brand-600"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>

        {/* Explore links */}
        <div className="col-span-1 md:col-span-2 md:col-start-6">
        <p className="overline mb-4 text-zinc-500">Explore</p>
          <ul className="space-y-2.5 text-sm">
            {EXPLORE.map(l => (
              <li key={l.href}>
                <Link href={l.href} className="text-zinc-600 transition-colors hover:text-brand-700">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company links */}
        <div className="col-span-1 md:col-span-2">
          <p className="overline mb-4 text-zinc-500">Company</p>
          <ul className="space-y-2.5 text-sm">
            {COMPANY.map(l => (
              <li key={l.href}>
                <Link href={l.href} className="text-zinc-600 transition-colors hover:text-brand-700">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + CTA */}
        <div className="col-span-2 md:col-span-3">
          <p className="overline mb-4 text-zinc-500">Get in touch</p>
          <div className="space-y-2 text-sm">
            <a href="mailto:info@ecoshiftcorp.com" className="block text-zinc-600 transition-colors hover:text-brand-700">
              info@ecoshiftcorp.com
            </a>
            <a href="tel:+6328888888" className="block text-zinc-600 transition-colors hover:text-brand-700">
              +63 (2) 8888-8888
            </a>
          </div>

          {/* CTA block */}
          <div className="mt-6 border-t border-rule pt-6">
            <p className="mb-3 text-xs leading-relaxed text-zinc-500">
              Need a quote for your next project? We'll respond within one business day.
            </p>
            <Link href="/quote" className="btn w-full justify-center">
              Request a Quote
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-rule">
        <div className="container flex flex-col gap-1.5 py-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Ecoshift Corporation. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-zinc-400">Privacy Policy</Link>
            <span aria-hidden="true">·</span>
            <span>Made in the Philippines</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
