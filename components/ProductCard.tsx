'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import AddToQuoteButton from './AddToQuoteButton'

const PROMO = /^\s*\[BD\]\s*/i

function parseCode(raw: string) {
  return { isPromo: PROMO.test(raw), code: raw.replace(PROMO, '') }
}

export default function ProductCard({ product }: { product: Product }) {
  const img  = product.mainImage || '/og-default.webp'
  const href = `/products/${product.slug}`
  const desc = product.itemDescription.length > 100
    ? product.itemDescription.slice(0, 97) + '…'
    : product.itemDescription
  const { isPromo, code } = parseCode(product.itemCode ?? '')
  const hasPrice = product.regularPrice > 0

  return (
    <article className="product-card group flex h-full flex-col">
      {/* ── Image block ── */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[4/3] overflow-hidden bg-zinc-100"
      >
        <Image
          src={img}
          alt=""
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* Product family — flush top-left, no pill */}
        {product.productFamily && (
          <span className="absolute left-0 top-0 bg-ink/75 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
            {product.productFamily}
          </span>
        )}

        {/* Promo badge — top-right, flat, no pill */}
        {isPromo && (
          <span className="absolute right-0 top-0 bg-brand-600 px-2.5 py-1 text-[0.6rem] font-extrabold uppercase tracking-widest text-white">
            Promo
          </span>
        )}
      </Link>

      {/* ── Info block ── */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {/* Mono item code */}
        {code && (
          <p className="mono-tag">{code}</p>
        )}

        {/* Product name — stretched link covers the whole card */}
        <h3 className="text-sm font-bold leading-snug text-ink line-clamp-2">
          <Link
            href={href}
            className="transition-colors after:absolute after:inset-0 hover:text-brand-700 focus-visible:text-brand-700"
          >
            {product.name}
          </Link>
        </h3>

        {/* Short description */}
        {desc && (
          <p className="flex-1 text-xs leading-relaxed text-zinc-500 line-clamp-2">{desc}</p>
        )}

        {/* Price — hard divider, not a card */}
        <div className="mt-auto border-t border-rule pt-3">
          {hasPrice ? (
            <span className="text-base font-extrabold tracking-tight text-ink">
              ₱{product.regularPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          ) : (
            <span className="text-sm font-bold text-brand-700">Price on request</span>
          )}
        </div>

        {/* CTA — relative z-index above the stretched link */}
        <div className="relative z-10 mt-2">
          <AddToQuoteButton product={product} variant="stepper" />
        </div>
      </div>
    </article>
  )
}
