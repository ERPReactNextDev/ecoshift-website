import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'
import MetricCard from '@/components/kokonutui/metric-card'
import ActivityTerrain from '@/components/kokonutui/activity-terrain'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800', reviewed: 'bg-blue-100 text-blue-800',
  quoted: 'bg-purple-100 text-purple-800', won: 'bg-green-100 text-green-800', lost: 'bg-red-100 text-red-800'
}

interface Props { searchParams: Promise<{ status?: string; search?: string; page?: string }> }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function AdminQuotationsPage({ searchParams }: Props) {
  const params = await searchParams
  const status = params.status ?? ''
  const search = params.search ?? ''
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const perPage = 20

  let query = supabaseAdmin.from('quotations').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  if (search) query = query.or(`reference.ilike.%${search}%,customer_name.ilike.%${search}%,email.ilike.%${search}%`)
  query = query.range((page - 1) * perPage, page * perPage - 1)

  const { data: quotations, count } = await query
  const total = count ?? 0
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-zinc-900">Quotation Requests</h1><p className="text-sm text-zinc-500 mt-1">{total} total</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricCard label="Quotations" />
        <ActivityTerrain title="Submission activity" />
      </div>
      <form method="GET" className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1"><label htmlFor="status" className="text-xs font-medium text-zinc-600">Status</label>
          <select id="status" name="status" defaultValue={status} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            {['pending','reviewed','quoted','won','lost'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select></div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]"><label htmlFor="search" className="text-xs font-medium text-zinc-600">Search</label>
          <input id="search" type="search" name="search" defaultValue={search} placeholder="Reference, name, email…" className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" /></div>
        <button type="submit" className="btn-primary px-4 py-2 text-sm">Filter</button>
        {(status || search) && <Link href="/admin/quotations" className="btn-secondary px-4 py-2 text-sm">Clear</Link>}
      </form>
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {(quotations?.length ?? 0) > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-zinc-50"><tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Status</th>
              </tr></thead>
              <tbody className="bg-white divide-y divide-zinc-100">
                {quotations!.map(q => (
                  <tr key={q.id} className="hover:bg-zinc-50 cursor-pointer">
                    <td className="px-4 py-3 text-sm font-medium text-brand-600"><Link href={`/admin/quotations/${q.id}`}>{q.reference}</Link></td>
                    <td className="px-4 py-3 text-sm text-zinc-900">{q.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-zinc-600">{q.company ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">{formatDate(q.created_at)}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[q.status] ?? 'bg-zinc-100 text-zinc-800'}`}>{q.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="py-16 text-center text-zinc-500">No quotation requests found.</div>}
      </div>
    </div>
  )
}

