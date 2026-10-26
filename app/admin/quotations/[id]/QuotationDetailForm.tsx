'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const statusOptions = ['pending', 'reviewed', 'quoted', 'won', 'lost']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function QuotationDetailForm({ quotation }: { quotation: Record<string, any> }) {
  const router = useRouter()
  const [status, setStatus] = useState(quotation.status)
  const [notes, setNotes] = useState(quotation.internal_notes ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch(`/api/admin/quotations/${quotation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, internal_notes: notes })
      })
      if (res.ok) { setMessage('Saved successfully.'); router.refresh() }
      else setMessage('Failed to save.')
    } catch { setMessage('Error saving.') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select id="status" value={status} onChange={e => setStatus(e.target.value)} className="input-field">
            {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
          <textarea id="notes" rows={5} value={notes} onChange={e => setNotes(e.target.value)} className="input-field" placeholder="Add notes visible only to staff…" />
        </div>
        {message && <p className="text-sm text-gray-600">{message}</p>}
        <button type="submit" className="btn-primary w-full" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
      </form>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <a href={`mailto:${quotation.email}?subject=Re: ${quotation.reference}`} className="block w-full text-center btn-secondary text-sm">Reply via Email</a>
      </div>
    </div>
  )
}
