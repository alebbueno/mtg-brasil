/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/actions/deckActions.ts
'use server'

import { createClient } from '@/app/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { fetchCardByName, fetchCardsByNames, getCardPriceFromScryfall } from '@/app/lib/scryfall'

import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// --- Tipos e Interfaces ---
interface DeckCard {
  count: number;
  name: string;
  have_physical?: boolean;
  price_usd?: number;
  price_updated_at?: string;
}

interface Decklist {
  mainboard: DeckCard[];
  sideboard?: DeckCard[];
}

interface FormState {
  message: string;
  success?: boolean;
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

// ============================================================================
// --- AÇÃO PARA CRIAR UM DECK (COM PREÇOS NO JSON) ---
// ============================================================================
export async function createDeck(prevState: FormState, formData: FormData): Promise<FormState> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { return { message: "..." } }
    
    // ... (Coleta de dados do formulário e validações iniciais como antes) ...
    const creationMode = formData.get('creationMode') as 'list' | 'builder';
    const name = formData.get('name') as string;
    const format = formData.get('format') as string;
    const description = formData.get('description') as string;
    let decklistText = formData.get('decklist') as string;
    const isPublic = formData.get('is_public') === 'on';
    const commanderName = formData.get('commander') as string | null;

    if (!name || name.trim().length < 3) return { message: "Erro: O nome do deck deve ter pelo menos 3 caracteres." }
    if (!format) return { message: "Erro: Por favor, selecione um formato para o deck." }
    if (creationMode === 'list' && format === 'commander' && (!commanderName || commanderName.trim() === '')) {
        return { message: "Erro: Para o formato Commander, é obrigatório especificar um comandante ao colar uma lista." }
    }
    if (creationMode === 'list' && (!decklistText || decklistText.trim() === '')) {
        return { message: "Erro: Para criar com uma lista pronta, o campo de cartas é obrigatório." }
    }

    const decklist: Decklist = { mainboard: [], sideboard: [] };
    
    if (creationMode === 'list') {
        if (format === 'commander' && commanderName) { decklistText = `1 ${commanderName}\n${decklistText}`; }
        const lines = decklistText.split('\n').filter(line => line.trim() !== '');
        let currentSection: 'mainboard' | 'sideboard' = 'mainboard';
        for (const line of lines) {
            if (line.toLowerCase().trim() === 'sideboard') { currentSection = 'sideboard'; continue; }
            const match = line.match(/^(\d+)x?\s+(.+)/i);
            if (match) {
                decklist[currentSection]?.push({ count: parseInt(match[1], 10), name: match[2].trim(), have_physical: false });
            }
        }
    } else {
        if (format === 'commander' && commanderName) {
            decklist.mainboard.push({ count: 1, name: commanderName, have_physical: false });
        }
    }
    
    // --- LÓGICA PARA ENRIQUECER O DECKLIST COM PREÇOS ---
    const allCards = [...decklist.mainboard, ...(decklist.sideboard || [])];
    const enrichedCardsPromises = allCards.map(async (card) => {
        const price = await getCardPriceFromScryfall(card.name);
        return {
            ...card,
            price_usd: price,
            price_updated_at: price !== null ? new Date().toISOString() : undefined,
        };
    });
    
    const enrichedCards = await Promise.all(enrichedCardsPromises);

    const finalDecklist: Decklist = {
        mainboard: enrichedCards.filter(c => decklist.mainboard.some(mc => mc.name === c.name)),
        sideboard: enrichedCards.filter(c => decklist.sideboard?.some(sc => sc.name === c.name)),
    };
    // --- FIM DA LÓGICA DE PREÇOS ---

    const allCardNames = [...new Set(allCards.map(c => c.name))];
    let representativeCardImageUrl = null;
    let color_identity: string[] = [];
    if(allCardNames.length > 0) {
        const scryfallData = await fetchCardsByNames(allCardNames);
        const colorIdentitySet = new Set<string>();
        scryfallData.forEach(card => { card.color_identity.forEach(color => colorIdentitySet.add(color)); });
        color_identity = Array.from(colorIdentitySet);
        if (finalDecklist.mainboard.length > 0) {
            const firstCardName = finalDecklist.mainboard[0].name;
            const cardData = scryfallData.find(c => c.name === firstCardName);
            representativeCardImageUrl = cardData?.image_uris?.art_crop || cardData?.image_uris?.normal;
        }
    }

    const { data: newDeck, error } = await supabase.from('decks').insert({
        user_id: user.id, name, format, description, decklist: finalDecklist, // Salva o decklist com os preços
        representative_card_image_url: representativeCardImageUrl, is_public: isPublic, color_identity,
    }).select('id, format').single();
    
    if (error) { return { message: "Erro na base de dados: não foi possível guardar o deck." }; }
    
    revalidatePath('/my-decks');
    if (creationMode === 'builder') { redirect(`/my-deck/${newDeck.format}/${newDeck.id}/edit`); } 
    else { redirect(`/my-deck/${newDeck.format}/${newDeck.id}`); }
}


// ============================================================================
// --- AÇÃO PARA EDITAR UM DECK (COM PREÇOS NO JSON) ---
// ============================================================================
export async function updateDeckContent(deckId: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { return { message: "Erro: Utilizador não autenticado.", success: false }; }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const isPublic = formData.get('is_public') === 'on';
  const cardsJSON = formData.get('cards') as string;

  if (!name || !cardsJSON) { return { message: "Nome do deck e lista de cartas são obrigatórios.", success: false }; }

  let parsedCards: { name: string; count: number; is_sideboard: boolean; have_physical?: boolean }[];
  try { parsedCards = JSON.parse(cardsJSON); } 
  catch (error) { return { message: "Erro ao processar a lista de cartas.", success: false }; }

  // --- LÓGICA PARA ENRIQUECER O DECKLIST COM PREÇOS ---
  const enrichedCardsPromises = parsedCards.map(async (card) => {
    const price = await getCardPriceFromScryfall(card.name);
    return {
        ...card,
        price_usd: price,
        price_updated_at: price !== null ? new Date().toISOString() : undefined,
    };
  });

  const enrichedCards = await Promise.all(enrichedCardsPromises);
  // --- FIM DA LÓGICA DE PREÇOS ---

  const decklist: Decklist = {
    mainboard: enrichedCards.filter(c => !c.is_sideboard).map(c => ({ name: c.name, count: c.count, have_physical: !!c.have_physical, price_usd: c.price_usd, price_updated_at: c.price_updated_at })),
    sideboard: enrichedCards.filter(c => c.is_sideboard).map(c => ({ name: c.name, count: c.count, have_physical: !!c.have_physical, price_usd: c.price_usd, price_updated_at: c.price_updated_at }))
  };

  const allCardNames = [...new Set(parsedCards.map(c => c.name))];
  
  if (allCardNames.length > 0) {
    const scryfallData = await fetchCardsByNames(allCardNames);
    const colorIdentitySet = new Set<string>();
    scryfallData.forEach(card => { card.color_identity.forEach(color => colorIdentitySet.add(color)); });
    const color_identity = Array.from(colorIdentitySet);

    const { data: originalDeck } = await supabase.from('decks').select('format').eq('id', deckId).single();
    
    const { error } = await supabase.from('decks').update({
        name, description, decklist, is_public: isPublic, color_identity, updated_at: new Date().toISOString(),
    }).eq('id', deckId).eq('user_id', user.id);

    if (error) { return { message: "Erro na base de dados: não foi possível guardar as alterações.", success: false }; }

    revalidatePath('/my-decks');
    revalidatePath(`/my-deck/${originalDeck?.format}/${deckId}`);
    return { message: "Deck guardado com sucesso!", success: true };
  }
  
  // ... (código de fallback para deck vazio) ...
  return { message: "Deck guardado com sucesso!", success: true };
}

// ============================================================================
// --- OUTRAS AÇÕES DO DECK ---
// ============================================================================

export async function updateDeckCoverImage(deckId: string, imageUrl: string) {
    'use server'
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Utilizador não autenticado.');
    }

    const { error } = await supabase
        .from('decks')
        .update({ representative_card_image_url: imageUrl })
        .eq('id', deckId)
        .eq('user_id', user.id);

    if (error) {
        throw new Error("Não foi possível atualizar a imagem de capa.");
    }

    revalidatePath(`/my-deck/.*`, 'layout');
}

export async function deleteDeck(deckId: string): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Utilizador não autenticado.' };
  }

  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)
    .eq('user_id', user.id); 

  if (error) {
    console.error('Erro ao excluir deck:', error);
    return { success: false, message: 'Não foi possível excluir o deck.' };
  }

  revalidatePath('/my-decks');
  
  return { success: true, message: 'Deck excluído com sucesso!' };
}

export async function deleteDecEdit(deckId: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Utilizador não autenticado.');
  }

  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)
    .eq('user_id', user.id); 

  if (error) {
    console.error('Erro ao excluir deck:', error);
    throw new Error('Não foi possível excluir o deck.');
  }

  revalidatePath('/my-decks');
  
  redirect('/my-decks');
}

export async function toggleSaveDeck(deckId: string): Promise<{ saved: boolean, message: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Apenas utilizadores autenticados podem guardar decks.');
  }

  const { data: existingSave, error: fetchError } = await supabase
    .from('saved_decks')
    .select('deck_id')
    .eq('user_id', user.id)
    .eq('deck_id', deckId)
    .maybeSingle();
  
  if (fetchError) {
    console.error("Erro ao verificar deck guardado:", fetchError);
    throw new Error("Não foi possível realizar a operação.");
  }

  if (existingSave) {
    const { error: deleteError } = await supabase
      .from('saved_decks')
      .delete()
      .eq('user_id', user.id)
      .eq('deck_id', deckId);
    
    if (deleteError) {
      console.error("Erro ao remover deck guardado:", deleteError);
      throw new Error("Não foi possível remover o deck dos seus guardados.");
    }

    return { saved: false, message: "Deck removido dos guardados." };
  } 
  else {
    const { error: insertError } = await supabase
      .from('saved_decks')
      .insert({ user_id: user.id, deck_id: deckId });

    if (insertError) {
      console.error("Erro ao guardar deck:", insertError);
      throw new Error("Não foi possível guardar o deck.");
    }
    
    return { saved: true, message: "Deck guardado com sucesso!" };
  }
}

interface AnalysisState {
  analysis?: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  error?: string;
}

export async function analyzeDeckWithAI(deckId: string, decklistText: string): Promise<AnalysisState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Apenas utilizadores autenticados podem analisar decks.' };
  }

  const prompt = `
    Analise a seguinte decklist de Magic: The Gathering.
    Decklist:
    ${decklistText}

    Forneça a sua análise no seguinte formato JSON, com 2-3 itens em cada array, em português do Brasil:
    {
      "strengths": ["Ponto forte 1", "Ponto forte 2"],
      "weaknesses": ["Ponto fraco 1", "Ponto fraco 2"],
      "suggestions": ["Sugestão de carta/estratégia 1", "Sugestão de carta/estratégia 2"]
    }
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
    });

    const analysisJSON = completion.choices[0]?.message?.content;
    if (!analysisJSON) {
      return { error: "A IA não conseguiu gerar uma análise." };
    }

    const analysisData = JSON.parse(analysisJSON);
    
    const { error: updateError } = await supabase
      .from('decks')
      .update({ ai_analysis: analysisData })
      .eq('id', deckId)
      .eq('user_id', user.id); 

    if (updateError) {
      console.error("Erro ao guardar a análise do deck:", updateError);
    }
    
    revalidatePath(`/my-deck/.*`, 'layout');

    return { analysis: analysisData };

  } catch (error) {
    console.error("Erro na análise da IA:", error);
    return { error: "Ocorreu um erro ao comunicar com a IA." };
  }
}