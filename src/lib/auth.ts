// app/lib/auth.ts

import { createClient } from '@/app/(site)/utils/supabase/server';
import { cache } from 'react';

/**
 * Verifica no lado do servidor se o usuário atual possui um cargo específico.
 * Usa o cache do React para evitar múltiplas buscas na mesma requisição.
 * @param role O cargo a ser verificado (ex: 'admin').
 * @returns `true` se o usuário tiver o cargo, `false` caso contrário.
 */
export const checkUserRole = cache(async (role: string): Promise<boolean> => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false; // Usuário não está logado
  }

  // Busca o perfil do usuário para obter o cargo
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    // Não logamos o erro aqui para não poluir os logs do servidor com tentativas de acesso
    return false;
  }

  return profile.role === role;
});