import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit } from '@/lib/rate-limit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  if (body.website) return NextResponse.json({ success: true }) // honeypot

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined
  const subject = typeof body.subject === 'string' ? body.subject.trim() : undefined
  const branch = typeof body.branch === 'string' ? body.branch.trim() : undefined

  const errors: string[] = []
  if (!name) errors.push('name is required')
  if (!email) errors.push('email is required')
  else if (!EMAIL_RE.test(email)) errors.push('email is not valid')
  if (!message) errors.push('message is required')
  if (errors.length > 0) return NextResponse.json({ error: errors.join('; ') }, { status: 400 })

  const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim()
  try {
    await checkRateLimit(ip, 'contact_form')
  } catch (r) {
    if (r instanceof Response) return r
    throw r
  }

  const { error: dbErr } = await supabaseAdmin.from('contact_submissions').insert({
    name, email, phone: phone ?? null, subject: subject ?? null, message, branch: branch ?? null
  })

  if (dbErr) {
    console.error('[api/contact]', dbErr.message)
    return NextResponse.json({ error: 'Failed to save contact submission' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
