/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/actions/deckActions.ts
'use server'

import { createClient } from '@/app/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ScryfallCard } from '@/app/lib/scryfall'
import { fetchCardByName } from '@/app/lib/scryfall'

// --- Tipos e Interfaces ---
interface DeckCard {
  count: number;
  name: string;
}

interface Decklist {
  mainboard: DeckCard[];
  sideboard?: DeckCard[];
}

interface FormState {
  message: string;
  errors?: {
    name?: string[];
    format?: string[];
    decklist?: string[];
  };
}

// --- Ação para ATUALIZAR a Privacidade ---
export async function updateDeckPrivacy(deckId: string, isPublic: boolean) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Utilizador não autenticado.')
  }

  const { error } = await supabase
    .from('decks')
    .update({ is_public: isPublic })
    .eq('id', deckId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Erro ao atualizar privacidade do deck:', error)
    throw new Error('Não foi possível alterar a privacidade do deck.')
  }

  revalidatePath(`/my-deck/[format]/[id]`, 'page')
  revalidatePath('/my-decks')
}

// --- Ação para CRIAR um Novo Deck ---
export async function createDeck(prevState: FormState, formData: FormData): Promise<FormState> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: "Erro: Apenas utilizadores autenticados podem criar decks." }
    }

    const name = formData.get('name') as string;
    const format = formData.get('format') as string;
    const description = formData.get('description') as string;
    let decklistText = formData.get('decklist') as string;
    const isPublic = formData.get('is_public') === 'on';
    const commanderName = formData.get('commander') as string | null;

    if (!name || name.trim().length < 3) return { message: "Erro: O nome do deck deve ter pelo menos 3 caracteres." }
    if (!format) return { message: "Erro: Por favor, selecione um formato para o deck." }
    if (format === 'commander' && (!commanderName || commanderName.trim() === '')) return { message: "Erro: Para o formato Commander, é obrigatório especificar um comandante." }
    if (!decklistText || decklistText.trim() === '') return { message: "Erro: A lista de cartas não pode estar vazia." }

    if (format === 'commander' && commanderName) {
        decklistText = `1 ${commanderName}\n${decklistText}`;
    }

    const lines = decklistText.split('\n').filter(line => line.trim() !== '');
    const decklist: Decklist = { mainboard: [], sideboard: [] };
    let currentSection: 'mainboard' | 'sideboard' = 'mainboard';

    for (const line of lines) {
        if (line.toLowerCase().trim() === 'sideboard') {
        currentSection = 'sideboard';
        continue;
        }
        const match = line.match(/^(\d+)x?\s+(.+)/i);
        if (match) {
        decklist[currentSection]?.push({
            count: parseInt(match[1], 10),
            name: match[2].trim(),
        });
        }
    }

    if (decklist.mainboard.length === 0) return { message: "Erro: Não foi possível encontrar cartas no mainboard." }

    let representativeCardImageUrl = null;
    const firstCardName = decklist.mainboard[0]?.name;
    if (firstCardName) {
        try {
            const cardData: ScryfallCard = await fetchCardByName(firstCardName, false);
            representativeCardImageUrl = cardData?.image_uris?.art_crop || cardData?.image_uris?.normal;
        } catch (e) {
            console.warn(`Não foi possível buscar a carta representativa: ${firstCardName}`);
        }
    }

    const { data: newDeck, error } = await supabase
        .from('decks')
        .insert({
            user_id: user.id, name, format, description, decklist,
            representative_card_image_url: representativeCardImageUrl,
            is_public: isPublic,
        })
        .select('id, format')
        .single();

    if (error) {
        console.error("Erro ao criar deck no Supabase:", error);
        return { message: "Erro na base de dados: não foi possível guardar o deck." };
    }

    revalidatePath('/my-decks');
    redirect(`/my-deck/${newDeck.format}/${newDeck.id}`);
}


// ============================================================================
// --- NOVA AÇÃO PARA EDITAR UM DECK ---
// ============================================================================
export async function editDeck(deckId: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { message: "Erro: Utilizador não autenticado." };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  let decklistText = formData.get('decklist') as string;
  const isPublic = formData.get('is_public') === 'on';
  const commanderName = formData.get('commander') as string | null;

  if (!name || name.trim().length < 3) return { message: "O nome do deck é obrigatório." };
  if (!decklistText) return { message: "A lista de cartas não pode estar vazia." };

  const { data: originalDeck } = await supabase.from('decks').select('format').eq('id', deckId).single();
  if (originalDeck?.format === 'commander' && commanderName) {
    decklistText = `1 ${commanderName}\n${decklistText}`;
  }

  const lines = decklistText.split('\n').filter(line => line.trim() !== '');
  const decklist: Decklist = { mainboard: [], sideboard: [] };
  let currentSection: 'mainboard' | 'sideboard' = 'mainboard';
  for (const line of lines) {
    if (line.toLowerCase().trim() === 'sideboard') {
      currentSection = 'sideboard';
      continue;
    }
    const match = line.match(/^(\d+)x?\s+(.+)/i);
    if (match) {
        decklist[currentSection]?.push({
        count: parseInt(match[1], 10),
        name: match[2].trim(),
      });
    }
  }

  let representativeCardImageUrl = null;
  const firstCardName = decklist.mainboard[0]?.name;
  if (firstCardName) {
    try {
      const cardData: ScryfallCard = await fetchCardByName(firstCardName, false);
      representativeCardImageUrl = cardData?.image_uris?.art_crop || cardData?.image_uris?.normal;
    } catch (e) {
      console.warn(`Não foi possível buscar a carta representativa: ${firstCardName}`);
    }
  }
  
  const { error } = await supabase
    .from('decks')
    .update({
      name, description, decklist, is_public: isPublic,
      representative_card_image_url: representativeCardImageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', deckId)
    .eq('user_id', user.id);

  if (error) {
    console.error("Erro ao editar deck:", error);
    return { message: "Erro na base de dados: não foi possível guardar as alterações." };
  }

  revalidatePath('/my-decks');
  revalidatePath(`/my-deck/${originalDeck?.format}/${deckId}`);
  redirect(`/my-deck/${originalDeck?.format}/${deckId}`);
}


// ============================================================================
// --- NOVA AÇÃO PARA EXCLUIR UM DECK ---
// ============================================================================
// ============================================================================
// --- AÇÃO PARA EXCLUIR UM DECK (ATUALIZADA) ---
// ============================================================================
// Agora, em vez de redirecionar, esta função retorna um objeto de sucesso ou erro.
export async function deleteDeck(deckId: string): Promise<{ success: boolean, message: string }> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Utilizador não autenticado.' };
  }

  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)
    .eq('user_id', user.id); // Garantia de segurança

  if (error) {
    console.error('Erro ao excluir deck:', error);
    return { success: false, message: 'Não foi possível excluir o deck.' };
  }

  // Revalida o cache para garantir que a lista estará atualizada no próximo carregamento
  revalidatePath('/my-decks');
  
  return { success: true, message: 'Deck excluído com sucesso.' };
}
