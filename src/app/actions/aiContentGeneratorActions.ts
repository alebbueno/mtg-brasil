/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import OpenAI from 'openai';
import { fetchCardsByNames } from '../lib/scryfall';
import { createDeckPrompt } from '../lib/ai/prompts';
import { createSocialPostsPrompt } from '../lib/ai/admin/prompts';
import { checkUserRole } from '@/lib/auth';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CoreCard { name: string; count: number; }
interface Decklist { mainboard: CoreCard[]; sideboard?: CoreCard[]; commander?: CoreCard[]; }
interface ContentPackage {
  name: string;
  description: string;
  decklist: Decklist;
  deck_check: Record<string, any>;
  social_posts: Record<string, string>;
}
interface GenerationState {
  contentPackage?: ContentPackage;
  error?: string;
  success: boolean;
  generation_log_id?: string;
}

const parseDecklistArray = (arr: any[]): CoreCard[] => {
  if (!arr || arr.length === 0) return [];
  if (typeof arr[0] === 'object' && arr[0] !== null && 'name' in arr[0] && 'count' in arr[0]) {
    return arr;
  }
  if (typeof arr[0] === 'string') {
    return arr.map(line => {
      const match = line.match(/^(\d+)x?\s+(.+)/i);
      const name = match ? match[2].trim().replace(/\s\([\w\d]+\)$/i, '') : null;
      return match ? { count: parseInt(match[1], 10), name: name! } : null;
    }).filter((c): c is CoreCard => c !== null);
  }
  return [];
};

async function calculateManaCurve(decklist: Decklist): Promise<Record<string, number>> {
    const cardNames = decklist.mainboard.map(c => c.name);
    const uniqueNames = [...new Set(cardNames)];
    if(uniqueNames.length === 0) return {};
    
    const cardsData = await fetchCardsByNames(uniqueNames);
    const cardMap = new Map(cardsData.map(c => [c.name, c]));
    const curve: Record<string, number> = {};
    decklist.mainboard.forEach(item => {
        const card = cardMap.get(item.name);
        if (card && typeof card.cmc === 'number' && !card.type_line.includes('Land')) {
            const cmc = Math.floor(card.cmc);
            curve[cmc] = (curve[cmc] || 0) + item.count;
        }
    });
    return curve;
}


export async function generateDeckContentPackage(prevState: GenerationState, formData: FormData): Promise<GenerationState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Usuário não autenticado.' };

  const format = formData.get('format') as string;
  const userPrompt = formData.get('user_prompt') as string | null;
  const commanderName = formData.get('commander') as string | null;

  if (!format || !userPrompt) {
    return { success: false, error: 'Formato e instruções são obrigatórios.' };
  }

  const deckPrompt = createDeckPrompt({ format, userPrompt, commanderName });
  let deckResult;
  try {
    const completion = await openai.chat.completions.create({
        messages: [{ role: 'system', content: "Aja como um especialista em Magic: The Gathering." }, { role: 'user', content: deckPrompt }],
        model: "gpt-4o",
        response_format: { type: "json_object" },
    });
    const content = completion.choices[0].message.content;
    if (!content) throw new Error("A IA não retornou um decklist.");
    deckResult = JSON.parse(content);
    deckResult.decklist.mainboard = parseDecklistArray(deckResult.decklist.mainboard);
    if(deckResult.decklist.sideboard) deckResult.decklist.sideboard = parseDecklistArray(deckResult.decklist.sideboard);
  } catch(e) {
    console.error("Erro na Geração da Decklist:", e);
    return { success: false, error: "Falha ao gerar a decklist."};
  }

  const decklistString = deckResult.decklist.mainboard.map((c: CoreCard) => `${c.count} ${c.name}`).join('\n');
  const deckCheckPrompt = `Analise a seguinte decklist do formato ${format}:\nComandante: ${commanderName || 'N/A'}\nDeck:\n${decklistString}\n\nFaça uma análise técnica detalhada ("Deck Check") em Português do Brasil, cobrindo os seguintes pontos: Modo de Jogo, Rota de Vitória, Dificuldade (Fácil, Médio ou Difícil), um array de Pontos Fortes, e um array de Pontos Fracos. Responda APENAS com um objeto JSON com a estrutura: { "playstyle": "string", "win_condition": "string", "difficulty": "string", "strengths": ["string"], "weaknesses": ["string"] }`;
  let deckCheckResult;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: 'user', content: deckCheckPrompt }],
      response_format: { type: "json_object" },
    });
    deckCheckResult = JSON.parse(completion.choices[0].message.content || '{}');
  } catch(e) {
    return { success: false, error: "Falha ao gerar a análise do deck."};
  }
  
  const socialPrompt = createSocialPostsPrompt({
    deckName: deckResult.name,
    deckDescription: deckResult.description,
    deckCheck: deckCheckResult,
    format: format,
    decklist: decklistString
  });
  let socialPostsResult;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: 'user', content: socialPrompt }],
      response_format: { type: "json_object" },
    });
    socialPostsResult = JSON.parse(completion.choices[0].message.content || '{}');
  } catch(e) {
    return { success: false, error: "Falha ao gerar os posts sociais."};
  }

  const contentPackage: ContentPackage = { ...deckResult, deck_check: deckCheckResult, social_posts: socialPostsResult };
  const manaCurve = await calculateManaCurve(contentPackage.decklist);
  const cardCount = (contentPackage.decklist.mainboard.reduce((s: any, c: any) => s + c.count, 0) || 0) + (contentPackage.decklist.sideboard?.reduce((s: any, c: any) => s + c.count, 0) || 0);
  
  const { data: logEntry } = await supabase.from('ai_deck_generations').insert({ user_id: user.id, format, input_prompt: userPrompt, generated_deck_name: contentPackage.name, card_count: cardCount, mana_curve: manaCurve, ai_model_used: 'gpt-4o' }).select('id').single();

  return { success: true, contentPackage, generation_log_id: logEntry?.id };
}

export async function saveAiGeneratedDeck(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect('/login'); return; }

  const name = formData.get('name') as string;
  const format = formData.get('format') as string;
  const description = formData.get('description') as string;
  const decklistJSON = formData.get('decklist') as string;
  const deckCheckJSON = formData.get('deck_check') as string;
  const socialPostsJSON = formData.get('social_posts') as string;
  const generation_log_id = formData.get('generation_log_id') as string | null;

  try {
    const decklist: Decklist = JSON.parse(decklistJSON);
    
    const allCardNames = decklist.mainboard.map((c: CoreCard) => c.name);
    const scryfallData = await fetchCardsByNames(allCardNames);
    const colorIdentitySet = new Set<string>();
    scryfallData.forEach(card => card.color_identity.forEach(color => colorIdentitySet.add(color)));
    const representative_card_image_url = scryfallData[0]?.image_uris?.art_crop;

    const { data: newDeck, error } = await supabase.from('decks').insert({
        user_id: user.id, name, format, description, decklist,
        deck_check: JSON.parse(deckCheckJSON),
        social_posts: JSON.parse(socialPostsJSON),
        color_identity: Array.from(colorIdentitySet), 
        representative_card_image_url, 
        is_public: true,
        source: 'ai_generated',
        // AJUSTE: Decks salvos pelo admin são do tipo 'site'
        owner_type: 'site'
    }).select('id').single();
    
    if (error) throw error;

    if (generation_log_id && newDeck) {
        await supabase
            .from('ai_deck_generations')
            .update({ was_saved: true, saved_deck_id: newDeck.id })
            .eq('id', generation_log_id);
    }
  } catch (error) {
    console.error("Erro ao salvar deck gerado:", error);
    return redirect('/admin/ai-generator?error=Falha ao salvar o deck');
  }
  
  revalidatePath('/admin/decks');
  revalidatePath('/admin/ai-generations');
  redirect('/admin/ai-generations');
}

/**
 * Ação de ADMIN para apagar um registro de geração de IA e o deck associado,
 * agora com logs detalhados para depuração.
 */
export async function deleteAiGeneration(generationId: string, savedDeckId: string | null) {
  console.log(`--- [AÇÃO INICIADA] deleteAiGeneration para log ID: ${generationId}`);
  
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    console.error('[AÇÃO FALHOU] Verificação de admin retornou false.');
    return { success: false, message: 'Acesso negado.' };
  }
  console.log('[AÇÃO] Verificação de admin bem-sucedida.');

  const supabase = createClient();

  // Etapa 1: Tenta apagar o deck salvo, se existir.
  if (savedDeckId) {
    console.log(`[AÇÃO] Tentando apagar o deck salvo com ID: ${savedDeckId}`);
    const { error: deckError } = await supabase
      .from('decks')
      .delete()
      .eq('id', savedDeckId);
    
    // Se houver um erro aqui, ele será registrado e a função terminará.
    if (deckError) {
      console.error('[AÇÃO] ERRO AO APAGAR O DECK DA TABELA "decks":', deckError);
      return { success: false, message: `Falha ao apagar deck salvo: ${deckError.message}` };
    }
    console.log(`[AÇÃO] Deck salvo ${savedDeckId} apagado com sucesso.`);
  }

  // Etapa 2: Tenta apagar o log da geração.
  console.log(`[AÇÃO] Tentando apagar o log de geração com ID: ${generationId}`);
  const { error: generationError } = await supabase
    .from('ai_deck_generations')
    .delete()
    .eq('id', generationId);
  
  // Se houver um erro aqui, ele será registrado.
  if (generationError) {
    console.error('[AÇÃO] ERRO AO APAGAR O LOG DA TABELA "ai_deck_generations":', generationError);
    return { success: false, message: `Falha ao apagar log: ${generationError.message}` };
  }
  console.log(`[AÇÃO] Log de geração ${generationId} apagado com sucesso.`);

  revalidatePath('/admin/ai-generations');
  return { success: true, message: 'Geração e deck associado foram apagados.' };
}