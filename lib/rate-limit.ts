import { supabaseAdmin } from './supabase-server'

const WINDOW_SECONDS = 600 // 10 minutes
const MAX_COUNT = 5

export async function checkRateLimit(ip: string, action: string): Promise<void> {
  const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
    p_ip: ip,
    p_action: action,
    p_window_seconds: WINDOW_SECONDS,
    p_max_count: MAX_COUNT
  })

  if (error) {
    console.error('[rate-limit] RPC error:', error.message)
    return // fail open — don't block on rate limit errors
  }

  if (data === false) {
    throw new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.', retryAfter: WINDOW_SECONDS }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(WINDOW_SECONDS)
        }
      }
    )
  }
}
