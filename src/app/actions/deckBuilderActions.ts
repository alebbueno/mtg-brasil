/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import OpenAI from 'openai';
import { fetchCardsByNames} from '../lib/scryfall';
// import { checkUserRole } from '@/lib/auth';
import { createDeckPrompt } from '../lib/ai/prompts'; // Importa nossa nova função

import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

interface CoreCard { name: string; count: number; }
interface Decklist { mainboard: CoreCard[]; sideboard?: CoreCard[]; commander?: CoreCard[]; }
interface BuildDeckState {
  deck?: { name: string; description: string; decklist: Decklist };
  error?: string;
  success: boolean;
  generation_log_id?: string;
}

const parseDecklistArray = (arr: any[]): CoreCard[] => {
  if (!arr || arr.length === 0) return [];
  if (typeof arr[0] === 'object' && arr[0] !== null && 'name' in arr[0] && 'count' in arr[0]) return arr;
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


export async function buildDeckWithAI(prevState: BuildDeckState, formData: FormData): Promise<BuildDeckState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Usuário não autenticado.' };
  
  const format = formData.get('format') as string;
  const cardsJSON = formData.get('cards') as string;
  const commanderName = formData.get('commander') as string | null;
  const userPrompt = formData.get('user_prompt') as string | null;

  if (!format) return { success: false, error: 'Formato não selecionado.' };

  let cards: CoreCard[];
  try { cards = JSON.parse(cardsJSON); }
  catch (e) { return { success: false, error: 'Erro ao processar a lista de cartas.' }; }

  if (cards.length === 0 && (!userPrompt || userPrompt.trim().length === 0)) {
    return { success: false, error: "Forneça algumas cartas ou instruções para a IA."}
  }

  const finalPrompt = createDeckPrompt({
    format,
    commanderName,
    coreCardsList: cards.map(c => `${c.count} ${c.name}`).join('\n'),
    userPrompt
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: "Aja como um especialista em Magic: The Gathering." }, { role: 'user', content: finalPrompt }],
      model: "gpt-4o",
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) return { success: false, error: 'A IA não retornou uma resposta válida.' };
    
    const parsedResult = JSON.parse(result);
    if (!parsedResult.name || !parsedResult.decklist || !Array.isArray(parsedResult.decklist.mainboard)) return { success: false, error: 'A IA retornou uma estrutura de deck inválida.' };
    
    parsedResult.decklist.mainboard = parseDecklistArray(parsedResult.decklist.mainboard);
    if (parsedResult.decklist.sideboard) parsedResult.decklist.sideboard = parseDecklistArray(parsedResult.decklist.sideboard);
    
    if (parsedResult.decklist.mainboard.length === 0) return { success: false, error: 'A IA não conseguiu gerar uma lista de cartas válida.' };
    
    const manaCurve = await calculateManaCurve(parsedResult.decklist);
    const cardCount = (parsedResult.decklist.mainboard.reduce((s: any, c: any) => s + c.count, 0) || 0) + (parsedResult.decklist.sideboard?.reduce((s: any, c: any) => s + c.count, 0) || 0);

    const { data: logEntry } = await supabase.from('ai_deck_generations').insert({ user_id: user.id, format, input_prompt: userPrompt, input_cards: cards, generated_deck_name: parsedResult.name, card_count: cardCount, mana_curve: manaCurve, ai_model_used: 'gpt-4o' }).select('id').single();

    return { success: true, deck: parsedResult, generation_log_id: logEntry?.id };
  } catch (error) {
    console.error("Erro na API da OpenAI:", error);
    return { success: false, error: 'Ocorreu um erro ao construir o deck. Tente novamente.' };
  }
}

export async function saveGeneratedDeck(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { redirect('/login'); return; }
    
    const name = formData.get('name') as string;
    const format = formData.get('format') as string;
    const description = formData.get('description') as string;
    const decklistJSON = formData.get('decklist') as string;
    const commanderName = formData.get('commander') as string | null;
    const generation_log_id = formData.get('generation_log_id') as string | null;

    try {
        const decklist: Decklist = JSON.parse(decklistJSON);
        if(commanderName && format === 'commander') {
            decklist.commander = [{ name: commanderName, count: 1 }];
        }
        
        const allCardNames = [...new Set([...(decklist.commander || []), ...decklist.mainboard, ...(decklist.sideboard || [])].map((c: CoreCard) => c.name))];
        const scryfallData = await fetchCardsByNames(allCardNames);
        const colorIdentitySet = new Set<string>();
        scryfallData.forEach(card => card.color_identity.forEach(color => colorIdentitySet.add(color)));
        const color_identity = Array.from(colorIdentitySet);
        const representative_card_image_url = scryfallData.find(c => c.name === (commanderName || allCardNames[0]))?.image_uris?.art_crop;

        const { data: newDeck, error } = await supabase.from('decks').insert({
            user_id: user.id, name, format, description, decklist,
            color_identity, representative_card_image_url, is_public: false,
            source: 'ai_generated'
        }).select('id').single();
        
        if (error) throw error;

        if (generation_log_id && newDeck) {
            await supabase.from('ai_deck_generations').update({ was_saved: true, saved_deck_id: newDeck.id }).eq('id', generation_log_id);
        }

    } catch (error) {
        console.error("Erro ao salvar deck gerado:", error);
        redirect('/ai-deck-builder?error=Falha ao salvar o deck');
        return;
    }
    
    revalidatePath('/my-decks');
    redirect('/my-decks');
}