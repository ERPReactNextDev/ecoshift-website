'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { Leaf } from 'lucide-react'

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(searchParams.get('error') === 'unauthorized' ? 'Your account does not have staff or admin access.' : '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr || !data.session) { setError(authErr?.message ?? 'Login failed.'); return }
      router.push('/admin/quotations')
      router.refresh()
    } catch { setError('Login failed. Please try again.') }
    finally { setLoading(false) }
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
          <h1 className="text-xl font-bold text-zinc-900 mb-1">Admin Login</h1>
          <p className="text-sm text-zinc-500 mb-6">Sign in to manage quotation requests.</p>
          {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700" role="alert">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-zinc-700">Email</label>
              <input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@ecoshift.com" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-zinc-700">Password</label>
              <input id="password" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-zinc-400"><a href="/" className="hover:text-zinc-600 transition-colors">← Back to website</a></p>
        <p className="mt-2 text-center text-xs text-zinc-400"><a href="/admin/register" className="hover:text-zinc-600 transition-colors">First time? Set up admin account →</a></p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center'>Loading�</div>}>
      <AdminLoginForm />
    </Suspense>
  )
}

