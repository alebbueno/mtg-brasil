/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchCardsByNames } from '../lib/scryfall';
import { createDeckForUserPrompt } from '../lib/ai/userPrompts';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

interface CoreCard { name: string; count: number; }
interface Decklist { mainboard: CoreCard[]; sideboard?: CoreCard[]; commander?: CoreCard[]; }
interface BuildDeckState {
  deck?: { name: string; description: string; decklist: Decklist };
  error?: string;
  success: boolean;
}

const parseDecklistArray = (arr: any[]): CoreCard[] => {
    if (!arr || arr.length === 0) return [];
    if (typeof arr[0] === 'object' && 'name' in arr[0] && 'count' in arr[0]) return arr;
    if (typeof arr[0] === 'string') {
      return arr.map(line => {
        const match = line.match(/^(\d+)x?\s+(.+)/i);
        const name = match ? match[2].trim().replace(/\s\([\w\d]+\)$/i, '') : null;
        return match ? { count: parseInt(match[1], 10), name: name! } : null;
      }).filter((c): c is CoreCard => c !== null);
    }
    return [];
};

const cleanJsonString = (rawResponse: string): string => {
    if (!rawResponse) return '{}';
    const startIndex = rawResponse.indexOf('{');
    const endIndex = rawResponse.lastIndexOf('}');
    if (startIndex === -1 || endIndex === -1) return '{}';
    return rawResponse.substring(startIndex, endIndex + 1);
};


export async function buildUserDeckWithAI(prevState: any, formData: FormData): Promise<BuildDeckState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Você precisa estar logado para usar esta função.' };
  
  const format = formData.get('format') as string;
  const commanderName = formData.get('commanderName') as string | null;
  const commanderColorIdentityJSON = formData.get('commanderColorIdentity') as string | null;
  const userPrompt = formData.get('user_prompt') as string | null;

  if (!format) return { success: false, error: 'Formato é obrigatório.' };
  if (format === 'commander' && !commanderName && !userPrompt) return { success: false, error: 'Para Commander, forneça um comandante ou uma instrução.' };

  const commanderColorIdentity = commanderColorIdentityJSON ? JSON.parse(commanderColorIdentityJSON) : null;
  const finalPrompt = createDeckForUserPrompt({ format, commanderName, userPrompt, commanderColorIdentity });

  try {
    const aiProvider = process.env.AI_PROVIDER || 'openai';
    let rawJsonResponse: string | undefined | null;

    if (aiProvider === 'google') {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(finalPrompt);
      rawJsonResponse = result.response.text();
    } else {
      const completion = await openai.chat.completions.create({ model: "gpt-4o-mini", messages: [{ role: 'user', content: finalPrompt }], response_format: { type: "json_object" } });
      rawJsonResponse = completion.choices[0]?.message?.content;
    }

    if (!rawJsonResponse) return { success: false, error: 'A IA não retornou uma resposta válida.' };
    
    const cleanedJson = cleanJsonString(rawJsonResponse);
    const parsedResult = JSON.parse(cleanedJson);

    parsedResult.decklist.mainboard = parseDecklistArray(parsedResult.decklist.mainboard);
    if (parsedResult.decklist.sideboard) parsedResult.decklist.sideboard = parseDecklistArray(parsedResult.decklist.sideboard);
    
    return { success: true, deck: parsedResult };

  } catch (error) {
    console.error("Erro na API de IA (Usuário):", error);
    return { success: false, error: 'Ocorreu um erro ao construir o deck.' };
  }
}

export async function saveUserDeck(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { redirect('/login'); return; }
    
    const name = formData.get('name') as string;
    const format = formData.get('format') as string;
    const description = formData.get('description') as string;
    const decklistJSON = formData.get('decklist') as string;
    const commanderName = formData.get('commanderName') as string | null;

    try {
        const decklist: Decklist = JSON.parse(decklistJSON);
        if(commanderName && format === 'commander') decklist.commander = [{ name: commanderName, count: 1 }];
        
        const allCardNames = [...new Set([...(decklist.commander || []), ...decklist.mainboard, ...(decklist.sideboard || [])].map(c => c.name))];
        const scryfallData = await fetchCardsByNames(allCardNames);
        const colorIdentitySet = new Set<string>();
        scryfallData.forEach(card => card.color_identity.forEach(color => colorIdentitySet.add(color)));
        const representative_card_image_url = scryfallData.find(c => c.name === (commanderName || allCardNames[0]))?.image_uris?.art_crop;

        const { data: newDeck, error } = await supabase.from('decks').insert({
            user_id: user.id, name, format, description, decklist,
            color_identity: Array.from(colorIdentitySet), representative_card_image_url, 
            is_public: false, source: 'ai_builder_user', owner_type: 'user'
        }).select('id, format').single();

        if (error) throw error;

        revalidatePath('/my-decks');
        redirect(`/my-decks/edit/${newDeck.format}/${newDeck.id}`);
    } catch (error) {
        redirect('/deckbuild?error=Falha ao salvar o deck');
    }
}