'use client'

import { Check, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useQuote } from '@/lib/quote-context'
import type { Product } from '@/lib/types'
import ParticleButton from '@/components/kokonutui/particle-button'

interface Props {
  product: Product
  variant?: 'stepper' | 'particle'
}

const MAX_QTY = 99

export default function AddToQuoteButton({ product, variant = 'stepper' }: Props) {
  const { items, addItem, updateQuantity, removeItem } = useQuote()

  const existing = items.find(i => i.productId === product.id)
  const quantity = existing?.quantity ?? 0

  function add() {
    addItem({ productId: product.id, productName: product.name, itemCode: product.itemCode, slug: product.slug })
  }

  function handleQuantityChange(qty: number) {
    if (qty <= 0) {
      removeItem(product.id)
    } else if (existing) {
      updateQuantity(product.id, Math.min(qty, MAX_QTY))
    } else {
      add()
    }
  }

  if (variant === 'particle') {
    return (
      <ParticleButton onClick={add} successLabel="Added!" className="w-full sm:w-auto">
        Add to Quote
      </ParticleButton>
    )
  }

  // Nothing in the quote yet: single call-to-action
  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => handleQuantityChange(1)}
        aria-label={`Add ${product.name} to quote`}
        className="group/btn flex w-full items-center justify-center gap-2 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
      >
        <ShoppingCart className="h-4 w-4 transition-transform group-hover/btn:-rotate-6" aria-hidden="true" />
        Add to Quote
      </button>
    )
  }

  // Already in the quote: quantity stepper
  return (
    <div
      role="group"
      aria-label={`${product.name} quantity`}
      className="flex items-stretch overflow-hidden border border-brand-600/30 bg-brand-50 text-brand-800"
    >
      <button
        type="button"
        onClick={() => handleQuantityChange(quantity - 1)}
        aria-label={quantity === 1 ? `Remove ${product.name} from quote` : 'Decrease quantity'}
        className="flex w-11 items-center justify-center transition-colors hover:bg-brand-100 hover:text-red-600 focus:outline-none focus-visible:bg-brand-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
      >
        {quantity === 1 ? <Trash2 className="h-4 w-4" aria-hidden="true" /> : <Minus className="h-4 w-4" aria-hidden="true" />}
      </button>

      <div className="flex flex-1 flex-col items-center justify-center py-1.5 leading-none" aria-live="polite">
        <span className="text-sm font-bold tabular-nums">{quantity}</span>
        <span className="mt-0.5 flex items-center gap-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-brand-700/80">
          <Check className="h-2.5 w-2.5" aria-hidden="true" /> In quote
        </span>
      </div>

      <button
        type="button"
        onClick={() => handleQuantityChange(quantity + 1)}
        disabled={quantity >= MAX_QTY}
        aria-label="Increase quantity"
        className="flex w-11 items-center justify-center transition-colors hover:bg-brand-100 focus:outline-none focus-visible:bg-brand-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}