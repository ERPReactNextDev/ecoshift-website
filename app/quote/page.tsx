'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Boxes, PackageOpen, ShoppingBasket, Trash2 } from 'lucide-react'
import { useQuote } from '@/lib/quote-context'
import SlideToConfirm from '@/components/kokonutui/slide-to-confirm'
import PageHero, { Glow } from '@/components/PageHero'
import { btnGreen, field, fieldLabel } from '@/lib/ui'

export default function QuotePage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, updateLineNote, clearQuote } = useQuote()

  const [customerName, setCustomerName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totalUnits = items.reduce((n, i) => n + i.quantity, 0)

  async function submit() {
    if (honeypot) return
    if (!customerName.trim()) { setError('Name is required.'); return }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Valid email is required.'); return }
    if (!phone.trim()) { setError('Phone number is required.'); return }
    if (!message.trim()) { setError('Message is required.'); return }
    if (items.length === 0) { setError('Your quote basket is empty.'); return }

    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: customerName.trim(), company: company.trim() || undefined, email: email.trim(), phone: phone.trim() || undefined, message: message.trim() || undefined, items })
      })
      if (res.status === 201) {
        const data = await res.json()
        clearQuote()
        router.push(`/quote/success?ref=${encodeURIComponent(data.reference)}`)
      } else {
        const d = await res.json().catch(() => ({}))
        setError(d?.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const hero = (
    <PageHero
      eyebrow="Quote request"
      title={<>Build your <Glow>quote</Glow></>}
      description="Review your selected LED and solar products, add notes, and our team will reply with pricing."
      compact
    />
  )

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {hero}
        <div className="mt-10 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <PackageOpen className="h-8 w-8" aria-hidden="true" />
          </span>
          <p className="mt-5 text-lg font-semibold text-zinc-900">Your quote basket is empty.</p>
          <p className="mt-1 text-sm text-zinc-500">Add products to start your request.</p>
          <Link href="/products" className={`${btnGreen} mt-6`}>Browse products <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {hero}

      {/* Summary */}
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-zinc-500"><ShoppingBasket className="h-4 w-4 text-brand-600" aria-hidden="true" />Products</dt>
          <dd className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">{items.length}</dd>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-zinc-500"><Boxes className="h-4 w-4 text-brand-600" aria-hidden="true" />Total units</dt>
          <dd className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">{totalUnits}</dd>
        </div>
      </dl>

      <form onSubmit={(e) => { e.preventDefault(); submit() }} noValidate className="mt-8">
        {/* Line items */}
        <section className="mb-10" aria-labelledby="items-heading">
          <h2 id="items-heading" className="text-2xl font-extrabold tracking-tight text-zinc-900">Items</h2>
          <div className="mt-4 overflow-x-auto rounded-3xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-zinc-600">Product</th>
                  <th className="w-28 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-[0.12em] text-zinc-600">Qty</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-zinc-600">Note</th>
                  <th className="w-12 px-4 py-3.5"><span className="sr-only">Remove</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {items.map(item => (
                  <tr key={item.productId} className="bg-white transition-colors hover:bg-brand-50/40">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-zinc-900">{item.productName}</p>
                      {item.itemCode && <p className="mt-0.5 text-xs text-zinc-500">Code: {item.itemCode}</p>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        aria-label={`Quantity for ${item.productName}`}
                        onChange={e => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                        className="w-20 rounded-xl border border-zinc-300 px-2 py-2 text-center text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      />
                    </td>
                    <td className="min-w-48 px-4 py-4">
                      <textarea
                        rows={2}
                        placeholder="Add a note…"
                        value={item.lineNote}
                        aria-label={`Note for ${item.productName}`}
                        onChange={e => updateLineNote(item.productId, e.target.value)}
                        className="w-full resize-y rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        aria-label={`Remove ${item.productName}`}
                      >
                        <Trash2 className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Customer info */}
        <section className="mb-8 max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8" aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-2xl font-extrabold tracking-tight text-zinc-900">Your details</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className={fieldLabel}>Name <span className="text-red-500">*</span></label>
              <input id="name" type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className={field} placeholder="Your full name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="company" className={fieldLabel}>Company <span className="text-zinc-400 font-normal normal-case tracking-normal">(optional)</span></label>
              <input id="company" type="text" value={company} onChange={e => setCompany(e.target.value)} className={field} placeholder="Company name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className={fieldLabel}>Email <span className="text-red-500">*</span></label>
              <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className={field} placeholder="your@email.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className={fieldLabel}>Phone <span className="text-red-500">*</span></label>
              <input id="phone" type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className={field} placeholder="+63 9XX XXX XXXX" />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="message" className={fieldLabel}>Message <span className="text-red-500">*</span></label>
              <textarea id="message" rows={4} required value={message} onChange={e => setMessage(e.target.value)} className={`${field} resize-y`} placeholder="Tell us about your project or requirements" />
            </div>
            <div className="hidden" aria-hidden="true">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
            </div>
          </div>
        </section>

        {error && (
          <div role="alert" className="mb-6 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <SlideToConfirm label="Slide to submit quote" confirmingLabel="Submitting…" doneLabel="Submitted" onConfirm={submit} />
      </form>
    </div>
  )
}
