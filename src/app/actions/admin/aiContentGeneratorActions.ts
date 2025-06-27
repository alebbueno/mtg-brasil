/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import OpenAI from 'openai';
import { fetchCardsByNames } from '@/app/lib/scryfall';
import { checkUserRole } from '@/lib/auth';
import { 
  createDecklistPrompt, 
  createDeckCheckPrompt, 
  createHowToPlayGuidePrompt,
  createSocialPostsPrompt 
} from '@/app/lib/ai/admin/prompts';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Tipos
interface CoreCard { name: string; count: number; }
interface Decklist { mainboard: CoreCard[]; sideboard?: CoreCard[]; commander?: CoreCard[]; }
interface ContentPackage {
  name: string;
  description: string;
  decklist: Decklist;
  deck_check: Record<string, any>;
  how_to_play_guide: string;
  social_posts: Record<string, string>;
}
interface GenerationState {
  contentPackage?: ContentPackage;
  error?: string;
  success: boolean;
  generation_log_id?: string;
}

// Função Auxiliar
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


/**
 * Orquestra uma cadeia de chamadas à IA para gerar um pacote de conteúdo completo.
 */
export async function generateDeckContentPackage(prevState: any, formData: FormData): Promise<GenerationState> {
  const isAdmin = await checkUserRole('admin');
  if(!isAdmin) return { success: false, error: "Acesso negado." };
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Usuário não autenticado.' };

  const format = formData.get('format') as string;
  const userPrompt = formData.get('user_prompt') as string | null;
  const commanderName = formData.get('commanderName') as string | null;
  const commanderColorIdentityJSON = formData.get('commanderColorIdentity') as string | null;
  const commanderColorIdentity = commanderColorIdentityJSON ? JSON.parse(commanderColorIdentityJSON) : null;

  if (!format || !userPrompt) return { success: false, error: 'Formato e instruções são obrigatórios.' };

  try {
    // --- Etapa 1: Gerar a Decklist ---
    console.log("IA Etapa 1: Gerando Decklist...");
    const deckPrompt = createDecklistPrompt({ format, userPrompt, commanderName, commanderColorIdentity });
    const deckCompletion = await openai.chat.completions.create({ messages: [{ role: 'user', content: deckPrompt }], model: "gpt-4o", response_format: { type: "json_object" } });
    const deckResult = JSON.parse(deckCompletion.choices[0].message.content || '{}');
    deckResult.decklist.mainboard = parseDecklistArray(deckResult.decklist.mainboard);
    if(deckResult.decklist.sideboard) deckResult.decklist.sideboard = parseDecklistArray(deckResult.decklist.sideboard);
    if (!deckResult.name) throw new Error("A IA não gerou nome para o deck.");

    // --- Etapa 2: Gerar o "Deck Check" ---
    console.log("IA Etapa 2: Gerando Deck Check...");
    const decklistString = deckResult.decklist.mainboard.map((c:CoreCard) => `${c.count} ${c.name}`).join('\n');
    const deckCheckPrompt = createDeckCheckPrompt({ 
      decklist: decklistString, 
      format, 
      commanderName, 
      deckName: deckResult.name, 
      deckDescription: deckResult.description 
    });
    const deckCheckCompletion = await openai.chat.completions.create({ model: "gpt-4o-mini", messages: [{ role: 'user', content: deckCheckPrompt }], response_format: { type: "json_object" } });
    const deckCheckResult = JSON.parse(deckCheckCompletion.choices[0].message.content || '{}');
    
    // --- Etapa 3: Gerar o Guia de "Como Jogar" ---
    console.log("IA Etapa 3: Gerando Guia de Como Jogar...");
    const howToPlayPrompt = createHowToPlayGuidePrompt({ deckName: deckResult.name, deckDescription: deckResult.description, deckCheck: deckCheckResult });
    const howToPlayCompletion = await openai.chat.completions.create({ model: "gpt-4o-mini", messages: [{ role: 'user', content: howToPlayPrompt }]});
    const howToPlayGuide = howToPlayCompletion.choices[0].message.content || "Não foi possível gerar o guia.";

    // --- Etapa 4: Gerar Posts para Redes Sociais ---
    console.log("IA Etapa 4: Gerando Posts Sociais...");
    const socialPrompt = createSocialPostsPrompt({ deckName: deckResult.name, deckDescription: deckResult.description, deckCheck: deckCheckResult, format: format, decklist: decklistString });
    const socialCompletion = await openai.chat.completions.create({ model: "gpt-4o-mini", messages: [{ role: 'user', content: socialPrompt }], response_format: { type: "json_object" } });
    const socialPostsResult = JSON.parse(socialCompletion.choices[0].message.content || '{}');

    // --- Etapa Final: Combinar tudo e registrar no histórico ---
    const contentPackage: ContentPackage = { 
      ...deckResult, 
      deck_check: deckCheckResult, 
      how_to_play_guide: howToPlayGuide,
      social_posts: socialPostsResult 
    };
    
    const { data: logEntry } = await supabase.from('ai_deck_generations').insert({ user_id: user.id, format, input_prompt: userPrompt, generated_deck_name: contentPackage.name, deck_check: contentPackage.deck_check, social_posts: contentPackage.social_posts, how_to_play_guide: contentPackage.how_to_play_guide }).select('id').single();

    return { success: true, contentPackage, generation_log_id: logEntry?.id };
  } catch(error) {
    console.error("Erro na Geração do Pacote de Conteúdo:", error);
    return { success: false, error: "Falha ao gerar o pacote de conteúdo. Verifique o console do servidor."};
  }
}

/**
 * Salva o pacote de conteúdo gerado como um novo deck no site.
 */
export async function saveAiGeneratedDeckAndContent(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { redirect('/login'); return; }

    const name = formData.get('name') as string;
    const format = formData.get('format') as string;
    const description = formData.get('description') as string;
    const decklistJSON = formData.get('decklist') as string;
    const deckCheckJSON = formData.get('deck_check') as string;
    // AJUSTE: Pegamos o novo campo do formulário
    const howToPlayGuide = formData.get('how_to_play_guide') as string;
    const socialPostsJSON = formData.get('social_posts') as string;
    const commanderName = formData.get('commanderName') as string | null;
    const generation_log_id = formData.get('generation_log_id') as string | null;

    try {
        const decklist: Decklist = JSON.parse(decklistJSON);
        if (commanderName && format === 'commander') {
            decklist.commander = [{ name: commanderName, count: 1 }];
        }

        const allCardNames = [...new Set([...(decklist.commander || []), ...decklist.mainboard, ...(decklist.sideboard || [])].map((c: CoreCard) => c.name))];
        const scryfallData = await fetchCardsByNames(allCardNames);
        const colorIdentitySet = new Set<string>();
        scryfallData.forEach(card => card.color_identity.forEach(color => colorIdentitySet.add(color)));
        const representative_card_image_url = scryfallData.find(c => c.name === (commanderName || allCardNames[0]))?.image_uris?.art_crop;

        const { data: newDeck, error } = await supabase.from('decks').insert({
            user_id: user.id,
            name,
            format,
            description,
            decklist,
            deck_check: JSON.parse(deckCheckJSON),
            social_posts: JSON.parse(socialPostsJSON),
            // AJUSTE: Salvamos o guia na nova coluna
            how_to_play_guide: howToPlayGuide,
            color_identity: Array.from(colorIdentitySet),
            representative_card_image_url,
            is_public: true,
            source: 'ai_generated',
            owner_type: 'site'
        }).select('id').single();
        
        if (error) {
            console.error("Erro no INSERT do deck:", error);
            throw error;
        }

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
    redirect('/admin/decks');
}