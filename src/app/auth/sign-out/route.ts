// app/auth/sign-out/route.ts
import { createClient } from '@/app/utils/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()

  // Verifica se o utilizador está de facto logado antes de tentar o logout
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Realiza o logout, invalidando a sessão do utilizador
    await supabase.auth.signOut()
  }

  // Redireciona o utilizador para a página inicial após o logout (ou falha silenciosa)
  // É importante redirecionar para que o Next.js possa renderizar novamente
  // os Server Components com o estado de autenticação atualizado.
  return NextResponse.redirect(new URL('/', req.url), {
    status: 302, // Código de redirecionamento padrão
  })
}
