import Link from 'next/link'
import {
  ArrowRight,
  Battery,
  Lamp,
  LampCeiling,
  Lightbulb,
  Package,
  Plug,
  Siren,
  Sun,
  Wrench,
  Zap,
  type LucideIcon
} from 'lucide-react'

interface Props {
  categories: string[]
  /** How many category cards to show (default 12 = two rows on desktop) */
  limit?: number
}

// Pick a fitting icon from the category name; falls back to a package icon.
function iconFor(category: string): LucideIcon {
  const c = category.toLowerCase()
  if (/emergency|exit|siren/.test(c)) return Siren
  if (/downlight|ceiling|recessed|surface|panel/.test(c)) return LampCeiling
  if (/bollard|post|pole|garden|lantern/.test(c)) return Lamp
  if (/solar|sun/.test(c)) return Sun
  if (/flood|high ?power|street|high ?bay/.test(c)) return Zap
  if (/bulb|filament|led|tube|strip|light|lamp/.test(c)) return Lightbulb
  if (/batter|power ?bank|charg|inverter|ups/.test(c)) return Battery
  if (/accessor|tool|install/.test(c)) return Wrench
  if (/plug|socket|outlet|switch|cable|wire|extension/.test(c)) return Plug
  if (/electric|breaker|circuit|energy/.test(c)) return Zap
  return Package
}

/**
 * E-commerce style "Shop by category" grid. Each card links straight to the
 * filtered product list. Kept under the old file name so existing imports still work.
 */
export default function HomeCategoryTabs({ categories, limit = 12 }: Props) {
  const displayed = categories.slice(0, limit)

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
      {displayed.map(cat => {
        const Icon = iconFor(cat)
        return (
          <li key={cat}>
            <Link
              href={`/products?category=${encodeURIComponent(cat)}`}
              className="group relative flex h-full flex-col items-center overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-600 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-900/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:p-6"
            >
              <span
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-300/0 blur-2xl transition-colors group-hover:bg-brand-300/25"
                aria-hidden="true"
              />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-500 text-white shadow-lg shadow-brand-600/25 transition-all duration-300 group-hover:scale-110 group-hover:from-white/25 group-hover:to-white/25 group-hover:text-white group-hover:shadow-brand-900/10">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="relative mt-4 text-sm font-bold uppercase leading-snug tracking-wide text-zinc-900 transition-colors group-hover:text-white">
                {cat}
              </h3>
              <span className="relative mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 transition-colors group-hover:text-white">
                Shop now
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}