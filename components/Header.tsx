'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowRight, Mail, Menu, Phone, ShoppingCart, X } from 'lucide-react'
import { useQuote } from '@/lib/quote-context'

const navItems = {
  '/': { name: 'Home' },
  '/products': { name: 'Products' },
  '/about': { name: 'About' },
  '/projects': { name: 'Projects' },
  '/blog': { name: 'Blog' },
  '/contact': { name: 'Contact' },
  '/branches': { name: 'Branches' },
}

const navList = Object.entries(navItems).map(([href, { name }]) => ({ href, name }))

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
}

export default function Header() {
  const { count } = useQuote()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // close the menu whenever the route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // lock page scroll + Escape to close while the menu is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // if the window grows to desktop width, make sure the mobile menu is closed
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => mq.matches && setOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const countLabel = count > 99 ? '99+' : String(count)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
        {/* soft green light hairline under the bar */}
        <div
          className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-brand-400/70 to-transparent"
          aria-hidden="true"
        />

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="group flex shrink-0 items-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            aria-label="Ecoshift Corporation — Home"
          >
            <Image
              src="/logo/ecoshift.png"
              alt="Ecoshift Corporation"
              width={180}
              height={44}
              priority
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105 sm:h-11"
            />
          </Link>

          {/* Desktop nav — clean links with a green active pill */}
          <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
            {navList.map(({ href, name }) => {
              const active = isActive(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-zinc-700 hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  {name}
                  {active && (
                    <span
                      className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-brand-500"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Quote basket */}
            <Link
              href="/quote"
              className="group relative flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white text-sm font-semibold text-zinc-800 shadow-sm transition-all hover:border-brand-500 hover:text-brand-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 md:h-10 md:w-auto md:px-4"
              aria-label={`View quote basket${count > 0 ? ` (${count} items)` : ''}`}
            >
              <ShoppingCart className="h-[1.15rem] w-[1.15rem] transition-transform group-hover:-rotate-6" />
              <span className="hidden md:inline">Quote</span>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[0.62rem] font-extrabold text-white ring-2 ring-white">
                  {countLabel}
                </span>
              )}
            </Link>

            {/* Primary desktop CTA */}
            <Link
              href="/quote"
              className="hidden items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 lg:inline-flex"
            >
              Request a Quote
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 shadow-sm transition-colors hover:border-brand-500 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/*
        Mobile menu. Rendered as a sibling of <header> (not inside it) because the header's
        backdrop-blur would otherwise trap this fixed panel inside the 64px bar.
      */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain bg-white transition-all duration-200 lg:hidden ${
          open ? 'visible translate-y-0 opacity-100' : 'invisible pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <nav
          aria-label="Mobile"
          className="mx-auto flex min-h-full max-w-xl flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4"
        >
          <ul className="flex flex-col gap-1">
            {navList.map(({ href, name }) => {
              const active = isActive(pathname, href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-[3.25rem] items-center justify-between rounded-2xl px-4 text-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      active ? 'bg-brand-50 text-brand-700' : 'text-zinc-800 hover:bg-zinc-100 active:bg-zinc-100'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full ${active ? 'bg-brand-500' : 'bg-zinc-300'}`}
                        aria-hidden="true"
                      />
                      {name}
                    </span>
                    <ArrowRight className={`h-4 w-4 ${active ? 'text-brand-600' : 'text-zinc-400'}`} aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-auto flex flex-col gap-4 pt-8">
            <Link
              href="/quote"
              className="flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 text-base font-bold text-white shadow-lg shadow-brand-600/25 transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {count > 0 ? `View Quote (${countLabel})` : 'Request a Quote'}
            </Link>

            <div className="grid grid-cols-1 gap-2 rounded-2xl border border-brand-100 bg-brand-50/60 p-3 text-sm sm:grid-cols-2">
              <a href="mailto:info@ecoshiftcorp.com" className="flex min-h-[2.75rem] items-center gap-2 rounded-xl px-2 text-zinc-700 hover:text-brand-700">
                <Mail className="h-4 w-4 text-brand-600" aria-hidden="true" />
                info@ecoshiftcorp.com
              </a>
              <a href="tel:+6328888888" className="flex min-h-[2.75rem] items-center gap-2 rounded-xl px-2 text-zinc-700 hover:text-brand-700">
                <Phone className="h-4 w-4 text-brand-600" aria-hidden="true" />
                +63 (2) 8888-8888
              </a>
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}
