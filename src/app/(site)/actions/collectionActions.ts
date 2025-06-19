/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/(site)/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface CollectionCard {
    card_scryfall_id: string;
    card_name: string;
    quantity: number;
    set_code: string;
    set_name: string;
    collector_number: string;
    image_url?: string;
    is_foil?: boolean;
}

/**
 * Adiciona ou atualiza a quantidade de uma carta na coleção do usuário.
 */
export async function upsertCardInCollection(card: CollectionCard) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  // CORREÇÃO 1: A verificação agora usa 'card.quantity' e chama a remoção com o ID correto.
  // Se a quantidade for 0 ou menos, removemos a carta em vez de tentar salvar com quantidade 0.
  if (card.quantity <= 0) {
      return removeCardFromCollection(card.card_scryfall_id);
  }

  const { error } = await supabase
    .from('user_collections')
    .upsert({
      ...card,
      user_id: user.id,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, card_scryfall_id' });

  if (error) {
    console.error("Erro ao salvar carta na coleção:", error);
    return { error: 'Não foi possível salvar a carta na coleção.' };
  }
  
  revalidatePath('/my-collection');
  revalidatePath('/my-deck/.*', 'page');
  return { success: true };
}

/**
 * Remove uma carta da coleção do usuário.
 */
// CORREÇÃO 2: A função agora recebe o ID do Scryfall (cardScryfallId) e apaga usando ele.
export async function removeCardFromCollection(cardScryfallId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { error } = await supabase
        .from('user_collections')
        .delete()
        .eq('user_id', user.id)
        .eq('card_scryfall_id', cardScryfallId); // Apagando pelo ID correto
    
    if (error) {
      console.error("Erro ao remover carta da coleção:", error)
      return { error: 'Não foi possível remover a carta da coleção.' };
    }

    revalidatePath('/my-collection');
    revalidatePath('/my-deck/.*', 'page');
    return { success: true };
}