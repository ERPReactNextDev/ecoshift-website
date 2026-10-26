import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit } from '@/lib/rate-limit'
import type { QuoteItem } from '@/lib/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  if (body.website) return NextResponse.json({ success: true }) // honeypot

  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const company = typeof body.company === 'string' ? body.company.trim() : undefined
  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined
  const message = typeof body.message === 'string' ? body.message.trim() : undefined
  const items = Array.isArray(body.items) ? (body.items as QuoteItem[]) : []

  const errors: string[] = []
  if (!customerName) errors.push('customerName is required')
  if (!email) errors.push('email is required')
  else if (!EMAIL_RE.test(email)) errors.push('email is not valid')
  if (items.length === 0) errors.push('items must contain at least one product')
  if (errors.length > 0) return NextResponse.json({ error: errors.join('; ') }, { status: 400 })

  const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim()
  try {
    await checkRateLimit(ip, 'submit_quote')
  } catch (r) {
    if (r instanceof Response) return r
    throw r
  }

  const reference = `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')}`

  const { data: quotation, error: qErr } = await supabaseAdmin
    .from('quotations')
    .insert({ reference, customer_name: customerName, company: company ?? null, email, phone: phone ?? null, message: message ?? null })
    .select('id').single()

  if (qErr || !quotation) {
    console.error('[api/quote]', qErr?.message)
    return NextResponse.json({ error: 'Failed to save quotation' }, { status: 500 })
  }

  const lineItems = items.map(item => ({
    quotation_id: quotation.id,
    product_id: item.productId,
    product_name: item.productName,
    sku: item.itemCode ?? null,
    quantity: item.quantity,
    unit: null,
    line_note: item.lineNote ?? null
  }))

  const { error: itemsErr } = await supabaseAdmin.from('quotation_items').insert(lineItems)
  if (itemsErr) {
    console.error('[api/quote] items error:', itemsErr.message)
    return NextResponse.json({ error: 'Failed to save quotation items' }, { status: 500 })
  }

  return NextResponse.json({ reference }, { status: 201 })
}
