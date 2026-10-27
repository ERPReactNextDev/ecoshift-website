'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, ShoppingCart, X } from 'lucide-react'
import { useQuote } from '@/lib/quote-context'

const NAV = [
  { href: '/products',  label: 'Products' },
  { href: '/about',     label: 'About' },
  { href: '/projects',  label: 'Projects' },
  { href: '/blog',      label: 'Blog' },
  { href: '/branches',  label: 'Branches' },
  { href: '/contact',   label: 'Contact' },
]

function active(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
}

export default function Header() {
  const { count } = useQuote()
  const pathname  = usePathname()
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Transparent → white on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock scroll while mobile menu is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', esc) }
  }, [open])

  // Close on desktop breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const fn = () => mq.matches && setOpen(false)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  const qLabel = count > 0 ? (count > 99 ? '99+' : String(count)) : null

  // When scrolled: solid white with bottom border
  // When at top: fully transparent, no border
  const headerClass = scrolled
    ? 'bg-white/98 border-b border-rule shadow-sm backdrop-blur-md'
    : 'bg-transparent border-b border-transparent'

  // Nav link colors — always dark regardless of scroll state
  // Only the header background transitions (transparent → white)
  const navTextBase  = 'text-zinc-700 hover:text-ink'
  const navTextActive = 'text-brand-700'

  return (
    <>
      {/* ── Top bar ── */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${headerClass}`}>
        <div className="container flex h-20 items-center gap-4">

          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label="Ecoshift Corporation — Home">
            <Image
              src="/logo/ecoshift.png"
              alt="Ecoshift Corporation"
              width={200}
              height={52}
              priority
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* ── Desktop nav ── */}
          <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-px lg:flex">
            {NAV.map(({ href, label }) => {
              const on = active(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={on ? 'page' : undefined}
                  className={`relative px-4 py-2 text-sm font-semibold transition-colors ${
                    on ? navTextActive : navTextBase
                  }`}
                >
                  {label}
                  {on && (
                    <span
                      className="absolute inset-x-4 -bottom-px h-[2px] bg-brand-600"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* ── Right actions ── */}
          <div className="ml-auto flex items-center gap-2">
            {/* Quote basket */}
            <Link
              href="/quote"
              className="relative flex h-10 items-center gap-1.5 border border-rule bg-white/80 px-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand-600 hover:text-brand-700 backdrop-blur-sm"
              style={{ borderRadius: 'var(--radius)' }}
              aria-label={`Quote basket${count > 0 ? ` — ${count} items` : ''}`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Quote</span>
              {qLabel && (
                <span
                  className="flex h-4 min-w-[1rem] items-center justify-center bg-brand-600 px-0.5 text-[0.6rem] font-extrabold text-white"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  {qLabel}
                </span>
              )}
            </Link>

            {/* Primary CTA */}
            <Link href="/quote" className="btn hidden lg:inline-flex">
              Request a Quote
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="flex h-10 w-10 items-center justify-center border border-rule bg-white/80 text-ink backdrop-blur-sm transition-colors hover:border-brand-600 hover:text-brand-700 lg:hidden"
              style={{ borderRadius: 'var(--radius)' }}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer ── */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={`fixed inset-x-0 top-20 z-40 border-b border-rule bg-paper transition-all duration-200 lg:hidden ${
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0 pointer-events-none'
        }`}
      >
        <nav aria-label="Mobile" className="container flex flex-col divide-y divide-rule pb-6">
          {NAV.map(({ href, label }) => {
            const on = active(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? 'page' : undefined}
                className={`flex items-center justify-between py-4 text-base font-semibold transition-colors ${
                  on ? 'text-brand-700' : 'text-ink'
                }`}
              >
                <span className="flex items-center gap-2">
                  {on && <span className="inline-block h-1.5 w-1.5 bg-brand-600" aria-hidden="true" />}
                  {label}
                </span>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </Link>
            )
          })}
          <div className="pt-5">
            <Link href="/quote" className="btn w-full justify-center">
              Request a Quote
              {count > 0 && <span className="ml-1 opacity-75">({qLabel})</span>}
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}
