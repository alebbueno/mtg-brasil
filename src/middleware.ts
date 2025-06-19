// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/app/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Cria um cliente Supabase específico para o middleware e obtém a resposta original.
  const { supabase, response } = createClient(request)

  // Atualiza a sessão do utilizador baseada nos cookies da requisição.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // --- Lógica de Redirecionamento ---
  
  // 1. Se o utilizador está logado e tenta aceder a páginas públicas como /login,
  //    redireciona-o para a página inicial.
  if (user && ['/login', '/signup', '/forgot-password'].includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. Se o utilizador não está logado e tenta aceder a uma página protegida,
  //    redireciona-o para a página de login.
  //    Páginas como a lista "Meus Decks" ou "Criar Deck" devem ser protegidas.
  const protectedRoutes = ['/profile', '/my-decks', '/my-deck/create', '/favorites', '/ai-deck-builder']
  if (!user && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // A rota de detalhe do deck (/my-deck/[format]/[id]) NÃO está na lista de rotas protegidas acima.
  // Isto significa que o middleware irá permitir que qualquer pessoa (logada ou não) aceda a ela.
  // A lógica de permissão para ver o deck (público vs. privado) será tratada na própria página.

  // Retorna a resposta, permitindo que a requisição continue.
  return response
}

export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de requisição, exceto para os que começam com:
     * - _next/static (ficheiros estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico (ficheiro de ícone)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
