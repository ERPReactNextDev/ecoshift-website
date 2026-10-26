'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock, Mail, MapPin, Paperclip, Phone } from 'lucide-react'
import FileUpload from '@/components/kokonutui/file-upload'
import PageHero, { Glow } from '@/components/PageHero'
import { branchNames, CONTACT } from '@/lib/branches'
import { btnGreen, btnOutline, field, fieldLabel, panelGreen } from '@/lib/ui'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [branch, setBranch] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Prefill the subject when arriving from a product page (/contact?subject=Inquiry: ...)
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('subject')
    if (s) setSubject(s.slice(0, 200))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot) return
    const errs: string[] = []
    if (!name.trim()) errs.push('Name is required.')
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.push('Valid email is required.')
    if (!message.trim()) errs.push('Message is required.')
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, subject: subject.trim() || undefined, message: message.trim(), branch: branch || undefined })
      })
      if (res.ok) setSuccess(true)
      else {
        const d = await res.json().catch(() => ({}))
        setErrors([d?.error ?? 'Something went wrong. Please try again.'])
      }
    } catch { setErrors(['Network error. Please try again.']) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <nav aria-label="Breadcrumb">
        <ol className="flex gap-1.5 text-sm text-zinc-500">
          <li><Link href="/" className="hover:text-brand-700">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-zinc-900">Contact</li>
        </ol>
      </nav>

      <PageHero
        eyebrow="Contact Ecoshift"
        title={<>Let&rsquo;s talk <Glow>lighting</Glow></>}
        description="Have a question about LED or solar lighting, or need a quote? Fill out the form and our team will get back to you shortly."
        compact
      />

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
        {/* Form */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 lg:col-span-3">
          {success ? (
            <div className="py-10 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900">Message sent!</h2>
              <p className="mt-2 text-sm text-zinc-600">Thank you for reaching out. We&rsquo;ll respond shortly.</p>
              <button onClick={() => setSuccess(false)} className={`${btnOutline} mt-6`}>Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-zinc-900">Send us a message</h2>
                <p className="mt-1 text-sm text-zinc-500">Fields marked <span className="text-red-500">*</span> are required.</p>
              </div>

              {errors.length > 0 && (
                <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <ul className="list-disc pl-4">{errors.map((er, i) => <li key={i}>{er}</li>)}</ul>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className={fieldLabel}>Name <span className="text-red-500">*</span></label>
                  <input id="name" type="text" required value={name} onChange={e => setName(e.target.value)} className={field} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className={fieldLabel}>Email <span className="text-red-500">*</span></label>
                  <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className={field} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className={fieldLabel}>Phone</label>
                  <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={field} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="branch" className={fieldLabel}>Nearest branch</label>
                  <select id="branch" value={branch} onChange={e => setBranch(e.target.value)} className={field}>
                    <option value="">Select a branch</option>
                    {branchNames.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="subject" className={fieldLabel}>Subject</label>
                <input id="subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} className={field} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className={fieldLabel}>Message <span className="text-red-500">*</span></label>
                <textarea id="message" rows={5} required value={message} onChange={e => setMessage(e.target.value)} className={`${field} resize-y`} />
              </div>
              <div className="hidden" aria-hidden="true">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
              </div>
              <button type="submit" disabled={submitting} className={`${btnGreen} w-full`}>
                {submitting ? 'Sending…' : <>Send Message <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
              </button>
            </form>
          )}
        </div>

        {/* Side column */}
        <div className="space-y-5 lg:col-span-2">
          <div className={`${panelGreen} p-6 sm:p-8`}>
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand-300/25 blur-3xl" aria-hidden="true" />
            <h2 className="relative text-xl font-extrabold tracking-tight text-zinc-900">Direct contact</h2>
            <ul className="relative mt-5 space-y-3 text-sm">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 text-zinc-600 hover:text-brand-700">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><Mail className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="break-all">{CONTACT.email}</span>
                </a>
              </li>
              <li>
                <a href={CONTACT.phoneHref} className="flex items-center gap-3 text-zinc-600 hover:text-brand-700">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><Phone className="h-5 w-5" aria-hidden="true" /></span>
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-zinc-600">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><Clock className="h-5 w-5" aria-hidden="true" /></span>
                {CONTACT.hours}
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-zinc-900">
              <Paperclip className="h-5 w-5 text-brand-600" aria-hidden="true" /> Attach files
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Plans, photos, or specs help us respond faster.</p>
            <div className="mt-4">
              <FileUpload maxFiles={3} acceptedFileTypes={['image/*', '.pdf']} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
              <MapPin className="h-6 w-6 text-brand-600" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-bold text-zinc-900">Prefer to visit?</h2>
              <p className="mt-1 text-sm text-zinc-600">We have branches across Luzon, Visayas, and Mindanao.</p>
              <Link href="/branches" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline">View branches <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
              <Paperclip className="h-6 w-6 text-brand-600" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-bold text-zinc-900">Looking for a quote?</h2>
              <p className="mt-1 text-sm text-zinc-600">Add LED and solar products to your quote basket.</p>
              <Link href="/products" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline">Browse products <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}