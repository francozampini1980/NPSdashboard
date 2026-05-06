import { createClient } from '@supabase/supabase-js'

// Solo usar en API routes del servidor — NUNCA en client components
// Usa service_role key que bypasses RLS
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
