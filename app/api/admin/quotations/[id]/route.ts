import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

interface Props { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Props) {
  const { id } = await params
  const body = await req.json()
  const { status, internal_notes } = body

  const valid = ['pending', 'reviewed', 'quoted', 'won', 'lost']
  if (!valid.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const { error } = await supabaseAdmin.from('quotations')
    .update({ status, internal_notes: internal_notes ?? null, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
