/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import { checkUserRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Ação para um admin atualizar o status de um usuário (ex: 'active', 'blocked').
 */
export async function updateUserStatus(userId: string, newStatus: 'active' | 'blocked') {
  // 1. Garante que apenas um admin pode executar esta ação
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    return { success: false, message: 'Acesso negado.' };
  }

  // 2. Garante que um admin não possa bloquear a si mesmo
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === userId) {
    return { success: false, message: 'Um administrador não pode bloquear a si mesmo.' };
  }

  // 3. Atualiza o perfil do usuário alvo
  const { error } = await supabase
    .from('profiles')
    .update({ status: newStatus })
    .eq('id', userId);

  if (error) {
    console.error("Erro ao atualizar status do usuário:", error);
    return { success: false, message: 'Erro no banco de dados.' };
  }

  // 4. Revalida o cache da página de usuários para mostrar a mudança
  revalidatePath('/admin/users');
  return { success: true, message: `Status do usuário atualizado para ${newStatus}.` };
}