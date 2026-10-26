'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Leaf } from 'lucide-react'

export default function AdminRegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data?.error ?? 'Registration failed.'); return }
      router.push('/admin/login')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2 text-brand-700 font-bold text-xl">
            <Leaf className="h-7 w-7 text-brand-600" />
            Ecoshift Corporation
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <h1 className="text-xl font-bold text-zinc-900 mb-1">Admin Setup</h1>
          <p className="text-sm text-zinc-500 mb-6">Create the first admin account (one-time setup).</p>
          {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700" role="alert">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-sm font-medium text-zinc-700">Name</label>
              <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Your name" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-zinc-700">Email</label>
              <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@ecoshift.com" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-zinc-700">Password</label>
              <input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">{loading ? 'Creating…' : 'Create Admin Account'}</button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-zinc-400"><Link href="/admin/login" className="hover:text-zinc-600 transition-colors">← Back to login</Link></p>
      </div>
    </div>
  )
}