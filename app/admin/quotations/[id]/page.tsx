import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'
import QuotationDetailForm from './QuotationDetailForm'

interface Props { params: Promise<{ id: string }> }

export default async function QuotationDetailPage({ params }: Props) {
  const { id } = await params
  const { data: quotation } = await supabaseAdmin.from('quotations').select('*').eq('id', id).single()
  if (!quotation) notFound()
  const { data: items } = await supabaseAdmin.from('quotation_items').select('*').eq('quotation_id', id).order('created_at')

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/quotations" className="text-sm text-gray-500 hover:text-brand-600">← Back to list</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{quotation.reference}</h1>
        <p className="text-sm text-gray-500 mt-1">Submitted {new Date(quotation.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><dt className="font-medium text-gray-500">Name</dt><dd className="text-gray-900">{quotation.customer_name}</dd></div>
              <div><dt className="font-medium text-gray-500">Company</dt><dd className="text-gray-900">{quotation.company ?? '—'}</dd></div>
              <div><dt className="font-medium text-gray-500">Email</dt><dd><a href={`mailto:${quotation.email}`} className="text-brand-600 hover:underline">{quotation.email}</a></dd></div>
              <div><dt className="font-medium text-gray-500">Phone</dt><dd className="text-gray-900">{quotation.phone ?? '—'}</dd></div>
            </dl>
            {quotation.message && <div className="mt-4"><dt className="font-medium text-gray-500 text-sm">Message</dt><dd className="mt-1 text-sm text-gray-700 bg-gray-50 rounded-md p-3">{quotation.message}</dd></div>}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-900">Items ({items?.length ?? 0})</h2></div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-gray-50"><tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Note</th>
                </tr></thead>
                <tbody className="divide-y divide-zinc-100">
                  {items?.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.product_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.sku ?? '—'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.line_note ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <QuotationDetailForm quotation={quotation} />
      </div>
    </div>
  )
}
