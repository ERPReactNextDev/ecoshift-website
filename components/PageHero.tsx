import type { ReactNode } from 'react'
import { Leaf, Lightbulb, Sun } from 'lucide-react'

type Props = {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  /** Buttons / links rendered under the description */
  children?: ReactNode
  /** Smaller padding for secondary pages (privacy, quote, ...) */
  compact?: boolean
}

/**
 * Light green hero used by every inner page. Keeps the same eco visual language
 * (soft green glow, dotted grid, rounded-3xl, sun / LED bulb / leaf motifs) but on
 * a bright, airy background to match the environment-first brand.
 */
export default function PageHero({ eyebrow, title, description, children, compact = false }: Props) {
  return (
    <section
      className={`relative mt-5 overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-emerald-50 px-5 sm:px-10 lg:px-14 ${
        compact ? 'py-10 sm:py-12' : 'py-12 sm:py-16 lg:py-20'
      }`}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-brand-300/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#16a34a_1px,transparent_1px)] [background-size:22px_22px]"
        aria-hidden="true"
      />

      {/* Eco motifs */}
      <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block" aria-hidden="true">
        <div className="relative h-52 w-52">
          <span className="absolute left-0 top-4 flex h-24 w-24 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-600 shadow-sm">
            <Sun className="h-10 w-10" />
          </span>
          <span className="absolute right-0 top-0 flex h-16 w-16 items-center justify-center rounded-full border border-brand-100 bg-white text-brand-600 shadow-sm">
            <Lightbulb className="h-7 w-7" />
          </span>
          <span className="absolute bottom-0 right-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-600 shadow-sm">
            <Leaf className="h-9 w-9" />
          </span>
        </div>
      </div>

      <div className="relative max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1
          className={`mt-5 font-extrabold leading-[1.08] tracking-tight text-zinc-900 ${
            compact ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl lg:text-6xl'
          }`}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">{description}</p>
        )}
        {children && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{children}</div>}
      </div>
    </section>
  )
}

/** Green gradient text for highlighted words in hero titles. */
export function Glow({ children }: { children: ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">{children}</span>
  )
}
