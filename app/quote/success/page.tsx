import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Leaf } from 'lucide-react'
import { btnAmber, btnGhostDark, panelGreen } from '@/lib/ui'

export const metadata: Metadata = { title: 'Quote Submitted' }

interface Props {
  searchParams: Promise<{ ref?: string }>
}

export default async function QuoteSuccessPage({ searchParams }: Props) {
  const { ref } = await searchParams

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className={`${panelGreen} mx-auto max-w-xl px-6 py-12 text-center sm:px-12 sm:py-16`}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-300/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#16a34a_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden="true" />

        <div className="relative">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-brand-200 bg-brand-100 text-brand-600">
            <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Quote request <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">submitted!</span>
          </h1>
          <p className="mt-3 text-zinc-600">Thank you. Our team will review your request and get back to you shortly.</p>

          {ref && (
            <div className="mx-auto mt-8 max-w-xs rounded-2xl border border-brand-100 bg-white px-5 py-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-zinc-600">Reference number</p>
              <p className="mt-1 break-all font-mono text-lg font-bold text-brand-700">{ref}</p>
            </div>
          )}

          <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-zinc-600">
            <Leaf className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            Thanks for choosing energy-efficient lighting.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/products" className={btnAmber}>
              Browse Products <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/" className={btnGhostDark}>Go Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
