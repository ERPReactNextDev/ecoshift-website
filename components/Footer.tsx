import Link from 'next/link'
import { Mail, Phone, Facebook, Linkedin } from 'lucide-react'

const exploreLinks = [
  { label: 'Products', href: '/products' },
  { label: 'Request a Quote', href: '/quote' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' }
]

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Branches', href: '/branches' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' }
]

const socials = [
  { label: 'Facebook', href: 'https://facebook.com/ecoshiftcorp', Icon: Facebook },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/ecoshiftcorp', Icon: Linkedin }
]

// min-h-11 = 44px touch target
const linkClass =
  'group inline-flex min-h-11 items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-brand-700 focus:outline-none focus-visible:text-brand-700 focus-visible:underline md:min-h-0 md:py-1'

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 md:mb-4">{title}</h2>
      <ul className="flex flex-col md:gap-1.5">
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className={linkClass}>
              <span
                className="hidden h-px w-0 bg-brand-500 transition-all duration-300 group-hover:w-3 md:block"
                aria-hidden="true"
              />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden border-t border-brand-100 bg-gradient-to-b from-brand-50 via-white to-emerald-50 text-zinc-600">
      {/* soft green glow along the top edge */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-56 w-[40rem] max-w-[160vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-300/20 blur-3xl md:w-[60rem]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12 md:gap-x-8">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-5 md:col-span-5">
            <Link
              href="/"
              className="flex w-fit items-center gap-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-emerald-500 text-white shadow-lg shadow-brand-600/25">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 .9 3 .74 5.9.16 8H17Z" />
                </svg>
              </span>
              <span className="text-xl font-extrabold tracking-tight text-zinc-900">Ecoshift Corporation</span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed">
              Energy-efficient lighting and electrical solutions for businesses and communities across the Philippines.
            </p>
            <p className="max-w-sm text-sm font-medium leading-relaxed text-brand-900">
              Together, let&rsquo;s choose the brighter choice for every Filipino,
              <span className="block font-normal italic text-brand-700">one community at a time.</span>
            </p>

            <div className="flex items-center gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-100 bg-white text-zinc-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <Icon className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 md:col-start-7">
            <LinkColumn title="Explore" links={exploreLinks} />
          </div>

          <div className="col-span-1 md:col-span-2">
            <LinkColumn title="Company" links={companyLinks} />
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-3">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 md:mb-4">Get in touch</h2>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <a
                  href="mailto:info@ecoshiftcorp.com"
                  className="flex min-h-12 items-center gap-3 rounded-xl border border-brand-100 bg-white px-4 text-zinc-600 shadow-sm transition-colors hover:border-brand-400 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:min-h-0 md:border-0 md:bg-transparent md:px-0 md:py-1 md:shadow-none"
                >
                  <Mail className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  <span className="break-all">info@ecoshiftcorp.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+6328888888"
                  className="flex min-h-12 items-center gap-3 rounded-xl border border-brand-100 bg-white px-4 text-zinc-600 shadow-sm transition-colors hover:border-brand-400 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:min-h-0 md:border-0 md:bg-transparent md:px-0 md:py-1 md:shadow-none"
                >
                  <Phone className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  +63 (2) 8888-8888
                </a>
              </li>
            </ul>
            <Link
              href="/quote"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-600 px-6 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:w-auto md:min-h-11"
            >
              Request a Quote
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t border-brand-100 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-6 text-center text-xs text-zinc-500 sm:flex-row sm:justify-between sm:text-left">
          <p>&copy; {year} Ecoshift Corporation. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/privacy" className="inline-flex min-h-9 items-center transition-colors hover:text-brand-700">
              Privacy Policy
            </Link>
            <span className="hidden text-brand-200 sm:inline" aria-hidden="true">
              •
            </span>
            <p>Built with <span className="text-brand-600">♥</span> in the Philippines</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
