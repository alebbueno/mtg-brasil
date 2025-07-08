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

// --- Lógica de IA Flexível ---
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');


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

/**
 * Adiciona ou remove um deck dos favoritos de um usuário.
 * AGORA ATUALIZA O CONTADOR CORRETO (save_count).
 */
export async function toggleSaveDeck(deckId: string, isCurrentlySaved: boolean) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Você precisa estar logado.' };
  }

  try {
    if (isCurrentlySaved) {
      // Remove dos favoritos
      const { error } = await supabase.from('saved_decks').delete().match({ user_id: user.id, deck_id: deckId });
      if (error) throw error;
      
      // Decrementa o save_count
      await supabase.rpc('decrement_deck_save_count', { deck_id_to_update: deckId });
      
      return { success: true, message: 'Deck removido dos favoritos.' };
    } else {
      // Adiciona aos favoritos
      const { error } = await supabase.from('saved_decks').insert({ user_id: user.id, deck_id: deckId });
      if (error) throw error;

      // Incrementa o save_count
      await supabase.rpc('increment_deck_save_count', { deck_id_to_update: deckId });

      return { success: true, message: 'Deck salvo nos favoritos!' };
    }
  } catch (error: any) {
    return { success: false, message: `Erro: ${error.message}` };
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

/**
 * AJUSTE: Função auxiliar para limpar a string de JSON vinda da IA,
 * removendo blocos de código Markdown e outros textos.
 */
const cleanJsonString = (rawResponse: string): string => {
  if (!rawResponse) return '{}';
  
  // Encontra o primeiro '{' e o último '}' para extrair o objeto JSON
  const startIndex = rawResponse.indexOf('{');
  const endIndex = rawResponse.lastIndexOf('}');

  if (startIndex === -1 || endIndex === -1) {
    // Retorna um objeto JSON vazio se não encontrar um JSON válido
    return '{}';
  }

  return rawResponse.substring(startIndex, endIndex + 1);
};

/**
 * Analisa uma decklist usando o provedor de IA definido no .env
 */
export async function analyzeDeckWithAI(deckId: string, decklistText: string): Promise<AnalysisState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Apenas usuários autenticados podem analisar decks.' };
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
    let rawJsonResponse: string | undefined | null;
    const aiProvider = process.env.AI_PROVIDER || 'openai';
    console.log(`[Análise] Usando o provedor de IA: ${aiProvider}`);

    if (aiProvider === 'google') {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      rawJsonResponse = result.response.text();
    } else {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
      });
      rawJsonResponse = completion.choices[0]?.message?.content;
    }

    if (!rawJsonResponse) {
      return { error: "A IA não conseguiu gerar uma análise." };
    }
    
    // AJUSTE: Limpamos a resposta antes de fazer o parse
    const cleanedJson = cleanJsonString(rawJsonResponse);
    const analysisData = JSON.parse(cleanedJson);
    
    const { error: updateError } = await supabase
      .from('decks')
      .update({ ai_analysis: analysisData, updated_at: new Date().toISOString() })
      .eq('id', deckId)
      .eq('user_id', user.id); 

    if (updateError) {
      console.error("Erro ao guardar a análise do deck:", updateError);
    }
    
    revalidatePath(`/my-deck/.*`, 'layout');

    return { analysis: analysisData };

  } catch (error) {
    console.error(`Erro na análise da IA com ${process.env.AI_PROVIDER}:`, error);
    return { error: "Ocorreu um erro ao comunicar com a IA." };
  }
}

/**
 * Cria uma cópia de um deck existente para o usuário logado.
 */
export async function cloneDeck(deckIdToClone: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  try {
    // 1. Busca o deck original para garantir que ele é público
    const { data: originalDeck, error: fetchError } = await supabase
      .from('decks')
      .select('*')
      .eq('id', deckIdToClone)
      .eq('is_public', true)
      .single();
    
    if (fetchError || !originalDeck) {
      throw new Error("Deck original não encontrado ou não é público.");
    }
    
    if (originalDeck.user_id === user.id) {
        return redirect(`/my-decks/edit/${originalDeck.format}/${originalDeck.id}`);
    }

    // AJUSTE CRÍTICO: Chama a função para incrementar o contador de CLONES
    await supabase.rpc('increment_deck_clone_count', { deck_id_to_update: deckIdToClone });

    // 2. Prepara os dados para o novo deck
    const newDeckData = {
      user_id: user.id,
      name: `Cópia de ${originalDeck.name}`,
      description: originalDeck.description,
      format: originalDeck.format,
      decklist: originalDeck.decklist,
      color_identity: originalDeck.color_identity,
      representative_card_image_url: originalDeck.representative_card_image_url,
      deck_check: originalDeck.deck_check,
      social_posts: originalDeck.social_posts,
      how_to_play_guide: originalDeck.how_to_play_guide,
      is_public: false,
      source: 'user_clone',
      owner_type: 'user',
    };

    // 3. Insere o novo deck e busca o ID e o FORMATO dele
    const { data: newDeck, error: insertError } = await supabase
      .from('decks')
      .insert(newDeckData)
      // AJUSTE: Pedimos também o formato de volta para usar no redirecionamento
      .select('id, format')
      .single();

    if (insertError) {
      throw insertError;
    }
    
    if (!newDeck) {
        throw new Error("Não foi possível obter os dados do deck recém-criado.");
    }

    // 4. Revalida o cache
    revalidatePath('/my-decks');
    
    // AJUSTE CRÍTICO: Usa o formato e o id para construir a URL correta
    redirect(`/my-decks/edit/${newDeck.format}/${newDeck.id}`);

  } catch (error: any) {
    console.error("Erro ao clonar deck:", error);
    return redirect(`/my-decks/`);
  }
}