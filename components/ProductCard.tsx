'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import AddToQuoteButton from './AddToQuoteButton'

// Item codes tagged "[BD]" are promo items, e.g. "[BD] SFG-EXT-GR-011"
const PROMO_TAG = /^\s*\[BD\]\s*/i

function parseItemCode(raw: string) {
  return {
    isPromo: PROMO_TAG.test(raw),
    code: raw.replace(PROMO_TAG, ''),
  }
}

export default function ProductCard({ product }: { product: Product }) {
  const heroImage = product.mainImage || '/og-default.webp'
  const href = `/products/${product.slug}`
  const truncated = product.itemDescription.length > 100
    ? product.itemDescription.slice(0, 97) + '…'
    : product.itemDescription
  const hasPrice = product.regularPrice > 0
  const { isPromo, code } = parseItemCode(product.itemCode ?? '')

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/10">
      {/* Image */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[4/3] overflow-hidden bg-zinc-100"
      >
        <Image
          src={heroImage}
          alt=""
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/15 to-transparent" aria-hidden="true" />

        {product.productFamily && (
          <span className={`absolute left-3 top-3 truncate rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-brand-700 shadow-sm backdrop-blur ${isPromo ? 'max-w-[calc(100%-5.5rem)]' : 'max-w-[calc(100%-1.5rem)]'}`}>
            {product.productFamily}
          </span>
        )}

        {isPromo && (
          <span className="absolute right-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-white shadow-sm">
            Promo
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Item code (without the [BD] tag) */}
        {code && (
          <p className="font-mono text-[0.7rem] uppercase tracking-wide text-zinc-400">
            {code}
          </p>
        )}

        {/* Name — the whole card is clickable through this link */}
        <h3 className="text-[0.95rem] font-semibold leading-snug text-zinc-900 line-clamp-2">
          <Link
            href={href}
            className="transition-colors after:absolute after:inset-0 after:z-0 hover:text-brand-600 focus:outline-none focus-visible:text-brand-600 focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-brand-500 focus-visible:after:rounded-2xl"
          >
            {product.name}
          </Link>
        </h3>

        {/* Description */}
        {truncated && (
          <p className="flex-1 text-xs leading-relaxed text-zinc-500 line-clamp-2">{truncated}</p>
        )}

        {/* Price */}
        <div className="mt-1 flex items-baseline gap-1.5 border-t border-zinc-100 pt-3">
          {hasPrice ? (
            <>
              <span className="text-lg font-extrabold tracking-tight text-zinc-900">
                ₱{product.regularPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              Request Quote
            </span>
          )}
        </div>

        {/* Add to quote — sits above the card-wide link */}
        <div className="relative z-10 mt-1">
          <AddToQuoteButton product={product} variant="stepper" />
        </div>
      </div>
    </article>
  )
}