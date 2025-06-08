// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/app/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Cria um cliente Supabase específico para o middleware e obtém a resposta original.
  const { supabase, response } = createClient(request)

  // Atualiza a sessão do utilizador baseada nos cookies da requisição.
  // Este passo é crucial para manter o estado de autenticação sincronizado.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Lógica de Redirecionamento:
  // 1. Se o utilizador está logado e tenta aceder a páginas públicas como /login,
  //    redireciona-o para a página inicial.
  if (user && ['/login', '/signup', '/forgot-password'].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. Se o utilizador não está logado e tenta aceder a uma página protegida,
  //    redireciona-o para a página de login.
  //    Adicione aqui outros caminhos que devem ser protegidos.
  if (!user && (request.nextUrl.pathname.startsWith('/profile') || request.nextUrl.pathname.startsWith('/favorites'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Retorna a resposta. A função `createClient` no helper do middleware
  // já trata de anexar os cookies atualizados à resposta, se a sessão tiver mudado.
  return response
}

export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de requisição, exceto para os que começam com:
     * - _next/static (ficheiros estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico (ficheiro de ícone)
     * Isto garante que o middleware corre em todas as páginas e rotas de API,
     * mas não em recursos estáticos.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
