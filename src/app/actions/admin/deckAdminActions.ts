/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchCardsByNames } from '@/app/lib/scryfall';
import { checkUserRole } from '@/lib/auth';

interface CoreCard { name: string; count: number; }
interface Decklist { mainboard: CoreCard[]; sideboard?: CoreCard[]; commander?: CoreCard[]; }

/**
 * Ação para um ADMIN criar um novo deck para a plataforma.
 */
export async function createSiteDeck(prevState: any, formData: FormData) {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    return { success: false, message: 'Acesso negado.' };
  }
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Admin não autenticado.' };
  }

  const name = formData.get('name') as string;
  const format = formData.get('format') as string;
  const description = formData.get('description') as string;
  const decklistJSON = formData.get('decklist') as string;
  const commanderName = formData.get('commanderName') as string | null;

  if (!name || !format || !decklistJSON) {
    return { success: false, message: 'Nome, formato e lista de cartas são obrigatórios.' };
  }

  try {
    const decklist: Decklist = JSON.parse(decklistJSON);
    
    if (commanderName && format === 'commander') {
      decklist.commander = [{ name: commanderName, count: 1 }];
    }
    
    const allCardNames = [...new Set([...(decklist.commander || []), ...decklist.mainboard, ...(decklist.sideboard || [])].map((c: CoreCard) => c.name))];
    
    if (allCardNames.length === 0) {
      return { success: false, message: 'O deck precisa de pelo menos uma carta.' };
    }

    const scryfallData = await fetchCardsByNames(allCardNames);
    const colorIdentitySet = new Set<string>();
    scryfallData.forEach(card => card.color_identity.forEach(color => colorIdentitySet.add(color)));
    const representative_card_image_url = scryfallData.find(c => c.name === (commanderName || allCardNames[0]))?.image_uris?.art_crop;

    const { data: newDeck, error } = await supabase.from('decks').insert({
      user_id: user.id, // Registra qual admin criou
      name,
      format,
      description,
      decklist,
      is_public: true, // Decks do site já nascem públicos
      color_identity: Array.from(colorIdentitySet),
      representative_card_image_url,
      owner_type: 'site', // <-- A MARCAÇÃO CRÍTICA
      source: 'admin_created',
    }).select('id').single();

    if (error) throw error;
    
    revalidatePath('/admin/decks');
    // Redireciona para a página de edição do deck recém-criado
    redirect(`/admin/decks/edit/${newDeck.id}`);

  } catch (error: any) {
    console.error("Erro ao criar deck de admin:", error);
    return { success: false, message: `Falha ao criar o deck: ${error.message}` };
  }
}


/**
 * Ação para um ADMIN atualizar um deck existente do site.
 */
export async function updateSiteDeck(deckId: string, prevState: any, formData: FormData) {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    return { success: false, message: 'Acesso negado.' };
  }

  try {
    const supabase = createClient();

    // Monta os objetos JSON a partir dos campos do formulário
    const deck_check = {
      playstyle: formData.get('deck_check_playstyle'),
      win_condition: formData.get('deck_check_win_condition'),
      difficulty: formData.get('deck_check_difficulty'),
      strengths: (formData.get('deck_check_strengths') as string).split(',').map(s => s.trim()),
      weaknesses: (formData.get('deck_check_weaknesses') as string).split(',').map(s => s.trim()),
    };

    const social_posts = {
      facebook: formData.get('social_post_facebook'),
      instagram: formData.get('social_post_instagram'),
      x: formData.get('social_post_x'),
      reddit: formData.get('social_post_reddit'),
    };
    
    const { error } = await supabase
      .from('decks')
      .update({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        how_to_play_guide: formData.get('how_to_play_guide') as string,
        deck_check,
        social_posts,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deckId);

    if (error) throw error;
    
    revalidatePath(`/admin/decks/edit/${deckId}`);
    return { success: true, message: 'Deck atualizado com sucesso!' };

  } catch (error: any) {
    console.error("Erro ao atualizar deck:", error);
    return { success: false, message: `Falha ao salvar: ${error.message}` };
  }
}

/**
 * Ação de ADMIN para apagar um deck do site.
 */
export async function deleteSiteDeck(deckId: string) {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    return { success: false, message: 'Acesso negado.' };
  }

  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId);

    if (error) throw error;

  } catch (error: any) {
    console.error("Erro ao apagar deck:", error);
    return { success: false, message: `Falha ao apagar o deck: ${error.message}` };
  }

  revalidatePath('/admin/decks');
  return { success: true, message: 'Deck apagado com sucesso.' };
}