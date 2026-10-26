import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'

interface Props { searchParams: Promise<{ search?: string; page?: string }> }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function ContactSubmissionsPage({ searchParams }: Props) {
  const params = await searchParams
  const search = params.search ?? ''
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const perPage = 20

  let query = supabaseAdmin.from('contact_submissions').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`)
  query = query.range((page - 1) * perPage, page * perPage - 1)

  const { data: submissions, count } = await query
  const total = count ?? 0

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-zinc-900">Contact Submissions</h1><p className="text-sm text-zinc-500 mt-1">{total} total</p></div>
      <form method="GET" className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]"><label htmlFor="search" className="text-xs font-medium text-zinc-600">Search</label>
          <input id="search" type="search" name="search" defaultValue={search} placeholder="Name, email, subject…" className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" /></div>
        <button type="submit" className="btn-primary px-4 py-2 text-sm">Search</button>
        {search && <Link href="/admin/contact-submissions" className="btn-secondary px-4 py-2 text-sm">Clear</Link>}
      </form>
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {(submissions?.length ?? 0) > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-zinc-50"><tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Message</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Date</th>
              </tr></thead>
              <tbody className="bg-white divide-y divide-zinc-100">
                {submissions!.map(s => (
                  <tr key={s.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900">{s.name}</td>
                    <td className="px-4 py-3 text-sm"><a href={`mailto:${s.email}`} className="text-brand-600 hover:underline">{s.email}</a></td>
                    <td className="px-4 py-3 text-sm text-zinc-600">{s.subject ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500 max-w-xs truncate" title={s.message}>{s.message}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">{formatDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="py-16 text-center text-zinc-500">No contact submissions found.</div>}
      </div>
    </div>
  )
}

