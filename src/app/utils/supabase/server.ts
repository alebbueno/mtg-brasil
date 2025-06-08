/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cria um cliente Supabase para ser usado no lado do servidor 
 * (em Server Components, Server Actions, e Route Handlers).
 * Ele gerencia cookies de autenticação de forma segura.
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            (await cookieStore).set({ name, value, ...options })
          } catch (error) {
            // A ação `set` pode falhar em Server Actions se o cabeçalho já tiver sido enviado.
            // Neste caso, você pode optar por ignorar o erro ou logá-lo.
            // https://github.com/vercel/next.js/issues/49373
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            (await cookieStore).set({ name, value: '', ...options })
          } catch (error) {
            // A ação `delete` pode falhar em Server Actions se o cabeçalho já tiver sido enviado.
            // Veja o link acima para mais detalhes.
          }
        },
      },
    }
  )
}
