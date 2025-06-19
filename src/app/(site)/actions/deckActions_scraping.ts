/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/actions/deckActions.ts
'use server'

import { createClient } from '@/app/(site)/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ScryfallCard } from '@/app/(site)/lib/scryfall'
import { fetchCardByName, fetchCardsByNames } from '@/app/(site)/lib/scryfall'
import { getLigamagicPrice } from '@/app/(site)/lib/scraping'

import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


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
  success?: boolean;
  errors?: {
    name?: string[];
    format?: string[];
    decklist?: string[];
  };
}

// AJUSTE: A função delay é mantida, mas sua chamada será comentada.
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
// --- AÇÃO PARA CRIAR UM DECK (AJUSTADA) ---
// ============================================================================
export async function createDeck(prevState: FormState, formData: FormData): Promise<FormState> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: "Erro: Apenas utilizadores autenticados podem criar decks." }
    }
    
    // ... (lógica de coleta de dados e validação)...
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
    let representativeCardImageUrl = null;
    let color_identity: string[] = [];
    const allCardNames = new Set<string>();

    if (creationMode === 'list') {
        if (format === 'commander' && commanderName) {
            decklistText = `1 ${commanderName}\n${decklistText}`;
        }
        const lines = decklistText.split('\n').filter(line => line.trim() !== '');
        let currentSection: 'mainboard' | 'sideboard' = 'mainboard';
        for (const line of lines) {
            if (line.toLowerCase().trim() === 'sideboard') {
                currentSection = 'sideboard';
                continue;
            }
            const match = line.match(/^(\d+)x?\s+(.+)/i);
            if (match) {
                const card = { count: parseInt(match[1], 10), name: match[2].trim(), have_physical: false };
                decklist[currentSection]?.push(card);
                allCardNames.add(card.name);
            }
        }
    } else {
        if (format === 'commander' && commanderName) {
            const card = { count: 1, name: commanderName, have_physical: false };
            decklist.mainboard.push(card);
            allCardNames.add(card.name);
        }
    }
    
    if (allCardNames.size > 0) {
        const scryfallData = await fetchCardsByNames(Array.from(allCardNames));
        const colorIdentitySet = new Set<string>();
        scryfallData.forEach(card => {
            card.color_identity.forEach(color => colorIdentitySet.add(color));
        });
        color_identity = Array.from(colorIdentitySet);
        if (decklist.mainboard.length > 0) {
            const firstCardName = decklist.mainboard[0].name;
            const cardData = scryfallData.find(c => c.name === firstCardName);
            representativeCardImageUrl = cardData?.image_uris?.art_crop || cardData?.image_uris?.normal;
        }
    }

    console.log('Iniciando atualização de preços para o deck...');
    for (const cardName of allCardNames) {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: existingPrice } = await supabase.from('card_prices').select('price_brl').eq('card_name', cardName).gte('last_updated_at', twentyFourHoursAgo).single();

        if (!existingPrice) {
            console.log(`Preço para "${cardName}" não encontrado ou desatualizado. Buscando na Ligamagic...`);
            const result = await getLigamagicPrice(cardName);
            if (result.price !== null) {
                await supabase.from('card_prices').upsert({ card_name: cardName, price_brl: result.price, source: 'ligamagic_min', last_updated_at: new Date().toISOString() }, { onConflict: 'card_name' });
                console.log(`Preço de "${cardName}" atualizado para R$ ${result.price}`);
            }
            // AJUSTE: Chamada ao delay comentada para evitar o erro.
            // await delay(2000); 
        } else {
            console.log(`Preço para "${cardName}" já está atualizado no cache.`);
        }
    }
    console.log('Atualização de preços finalizada.');

    const { data: newDeck, error } = await supabase.from('decks').insert({ user_id: user.id, name, format, description, decklist, representativeCardImageUrl, is_public: isPublic, color_identity, }).select('id, format').single();
    if (error) {
        console.error("Erro ao criar deck no Supabase:", error);
        return { message: "Erro na base de dados: não foi possível guardar o deck." };
    }

    revalidatePath('/my-decks');
    if (creationMode === 'builder') {
        redirect(`/my-deck/${newDeck.format}/${newDeck.id}/edit`);
    } else {
        redirect(`/my-deck/${newDeck.format}/${newDeck.id}`);
    }
}


// ============================================================================
// --- AÇÃO PARA EDITAR UM DECK (AJUSTADA) ---
// ============================================================================
export async function updateDeckContent(deckId: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { message: "Erro: Utilizador não autenticado.", success: false };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const isPublic = formData.get('is_public') === 'on';
  const cardsJSON = formData.get('cards') as string;

  if (!name || !cardsJSON) {
    return { message: "Nome do deck e lista de cartas são obrigatórios.", success: false };
  }

  let parsedCards: { name: string; count: number; is_sideboard: boolean; have_physical?: boolean }[];
  try {
    parsedCards = JSON.parse(cardsJSON);
  } catch (error) {
    return { message: "Erro ao processar a lista de cartas.", success: false };
  }

  const decklist: Decklist = {
    mainboard: parsedCards.filter(c => !c.is_sideboard).map(({ name, count, have_physical }) => ({ name, count, have_physical: !!have_physical })),
    sideboard: parsedCards.filter(c => c.is_sideboard).map(({ name, count, have_physical }) => ({ name, count, have_physical: !!have_physical }))
  };

  const allCardNames = [...new Set(parsedCards.map(c => c.name))];
  
  const scryfallData = await fetchCardsByNames(allCardNames);
  const colorIdentitySet = new Set<string>();
  scryfallData.forEach(card => {
      card.color_identity.forEach(color => colorIdentitySet.add(color));
  });
  const color_identity = Array.from(colorIdentitySet);

  console.log('Iniciando atualização de preços para o deck editado...');
  for (const cardName of allCardNames) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: existingPrice } = await supabase.from('card_prices').select('price_brl').eq('card_name', cardName).gte('last_updated_at', twentyFourHoursAgo).single();

      if (!existingPrice) {
          console.log(`Preço para "${cardName}" não encontrado ou desatualizado. Buscando na Ligamagic...`);
          const result = await getLigamagicPrice(cardName);
          if (result.price !== null) {
              await supabase.from('card_prices').upsert({ card_name: cardName, price_brl: result.price, source: 'ligamagic_min', last_updated_at: new Date().toISOString() }, { onConflict: 'card_name' });
              console.log(`Preço de "${cardName}" atualizado para R$ ${result.price}`);
          }
          // AJUSTE: Chamada ao delay comentada para evitar o erro.
          // await delay(2000);
      } else {
          console.log(`Preço para "${cardName}" já está atualizado no cache.`);
      }
  }
  console.log('Atualização de preços finalizada.');

  const { data: originalDeck } = await supabase.from('decks').select('format').eq('id', deckId).single();
  
  const { error } = await supabase
    .from('decks')
    .update({ name, description, decklist, is_public: isPublic, color_identity, updated_at: new Date().toISOString() })
    .eq('id', deckId)
    .eq('user_id', user.id);

  if (error) {
    console.error("Erro ao editar deck:", error);
    return { message: "Erro na base de dados: não foi possível guardar as alterações.", success: false };
  }

  revalidatePath('/my-decks');
  revalidatePath(`/my-deck/${originalDeck?.format}/${deckId}`);
  return { message: "Deck guardado com sucesso!", success: true };
}

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

