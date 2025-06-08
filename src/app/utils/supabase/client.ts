// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

/**
 * Cria um cliente Supabase para ser usado no lado do cliente (em componentes 'use client').
 * Ele utiliza as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
