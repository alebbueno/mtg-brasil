/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/(site)/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function signOut() {
  console.log('Iniciando logout');
  try {
    const supabase = createClient();
    
    // Verifica se há uma sessão ativa
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Usuário verificado:', user ? user.id : 'Nenhum usuário');
    
    if (userError) {
      console.error('Erro ao verificar usuário:', userError.message, userError);
    }

    // Tenta realizar o logout mesmo sem usuário, para limpar qualquer sessão residual
    console.log('Executando supabase.auth.signOut');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erro ao realizar logout:', error.message, error);
      throw new Error(`Falha ao realizar logout: ${error.message}`);
    }
    console.log('Logout executado com sucesso');

    // Remove cookies de autenticação
    const cookieStore = await cookies();
    const cookieNames = ['sb-access-token', 'sb-refresh-token', 'sb-provider-token', 'sb-provider-refresh-token'];
    cookieNames.forEach((name) => {
      try {
        cookieStore.delete(name);
        console.log(`Cookie removido: ${name}`);
      } catch (cookieError) {
        console.error(`Erro ao remover cookie ${name}:`, cookieError);
      }
    });

    // Invalida o cache
    console.log('Invalidando cache');
    revalidatePath('/', 'layout');
    
    // Redireciona para a página de login
    console.log('Redirecionando para /login');
    redirect('/login');
  } catch (error: any) {
    console.error('Erro no signOut:', error.message, error);
    redirect(`/error?message=Logout+failed:${encodeURIComponent(error.message)}`);
  }
}