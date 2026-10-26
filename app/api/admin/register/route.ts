import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    // Only allow registration when no staff/admin account exists yet (first-run setup).
    const { count, error: countErr } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .in('role', ['staff', 'admin'])
    if (countErr) {
      return NextResponse.json({ error: countErr.message }, { status: 500 })
    }
    if ((count ?? 0) > 0) {
      return NextResponse.json({ error: 'Registration is closed. An admin account already exists.' }, { status: 403 })
    }

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || email }
    })
    if (createErr || !created?.user) {
      return NextResponse.json({ error: createErr?.message ?? 'Failed to create user.' }, { status: 400 })
    }

    // The on_auth_user_created trigger already inserts a 'customer' profile row
    // for every new auth user, so upsert (rather than insert) to promote it.
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert(
        { id: created.user.id, role: 'admin', full_name: name || email },
        { onConflict: 'id' }
      )
    if (profileErr) {
      // best-effort cleanup
      await supabaseAdmin.auth.admin.deleteUser(created.user.id)
      return NextResponse.json({ error: profileErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}