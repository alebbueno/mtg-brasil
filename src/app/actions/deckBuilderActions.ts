/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/actions/deckBuilderActions.ts
'use server'

import { createClient } from '@/app/utils/supabase/server'
import OpenAI from 'openai';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { fetchCardByName, fetchCardsByNames } from '../lib/scryfall';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Tipos de Dados ---
interface DeckCard { count: number; name: string; }
interface Decklist { mainboard: DeckCard[]; sideboard: DeckCard[]; }
interface BuildDeckState {
  deck?: {
    name: string;
    description: string;
    decklist: Decklist;
  };
  error?: string;
  success: boolean;
}

// Schema para validar os dados do formulário
const BuildDeckSchema = z.object({
  format: z.string().min(1, { message: "O formato é obrigatório." }),
  cards: z.string().min(1, { message: "A lista de cartas não pode estar vazia." }),
  commander: z.string().optional(), // O comandante agora é um campo opcional
});


// ============================================================================
// --- AÇÃO PARA CONSTRUIR O DECK COM IA (ATUALIZADA) ---
// ============================================================================
export async function buildDeckWithAI(prevState: BuildDeckState, formData: FormData): Promise<BuildDeckState> {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) {
    return { error: 'Apenas utilizadores autenticados podem usar esta funcionalidade.', success: false };
  }

  const validatedFields = BuildDeckSchema.safeParse({
    format: formData.get('format'),
    cards: formData.get('cards'),
    commander: formData.get('commander'),
  });

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.flatten().fieldErrors;
    return { error: errorMessages.format?.[0] || errorMessages.cards?.[0] || 'Dados inválidos.', success: false };
  }
  
  const { format, cards: cardsJSON, commander: commanderName } = validatedFields.data;
  const initialCards: DeckCard[] = JSON.parse(cardsJSON);

  let commanderInfo = '';
  let colorIdentityInfo = '';
  let cardCountRequirement = `O deck final deve ter exatamente 60 cartas no mainboard.`;
  let fullInitialList = initialCards;

  if (format.toLowerCase() === 'commander') {
    cardCountRequirement = `O deck final deve ter exatamente 100 cartas, incluindo o comandante.`;
    
    if (commanderName) {
      try {
        const commanderData = await fetchCardByName(commanderName, false);
        const colors = commanderData.color_identity.join('');
        colorIdentityInfo = `A identidade de cor deste deck de Commander é ${colors}. Todas as cartas adicionadas DEVEM respeitar esta identidade de cor.`;
        commanderInfo = `O comandante é ${commanderName}.`;
        // Adiciona o comandante à lista que será enviada para a IA
        fullInitialList = [{ name: commanderName, count: 1 }, ...initialCards];
      } catch (error) {
        return { error: `Não foi possível encontrar o comandante "${commanderName}". Verifique o nome.`, success: false };
      }
    } else {
       return { error: `Para o formato Commander, por favor adicione um comandante à lista.`, success: false };
    }
  }

  const prompt = `
    Você é um especialista em construção de decks de Magic: The Gathering.
    Um utilizador quer criar um deck do formato '${format}'. ${commanderInfo}
    ${colorIdentityInfo}

    A lista de cartas base fornecida pelo utilizador é:
    ${JSON.stringify(fullInitialList)}

    Sua tarefa é:
    1.  ${cardCountRequirement}
    2.  Com base na estratégia sugerida pelas cartas iniciais, adicione cartas que tenham boa sinergia.
    3.  Construa uma base de mana sólida e consistente, com aproximadamente 36-38 terrenos para Commander.
    4.  Crie um nome criativo e temático para o deck.
    5.  Escreva um "primer" conciso (2-3 parágrafos) explicando a estratégia.
    
    Retorne sua resposta em um único objeto JSON estrito, sem nenhum texto ou formatação adicional:
    {
      "name": "Nome do Deck",
      "description": "...",
      "decklist": { "mainboard": [...], "sideboard": [] }
    }
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
    });

    const responseJSON = completion.choices[0]?.message?.content;
    if (!responseJSON) {
      return { error: "A IA não conseguiu gerar uma análise.", success: false };
    }

    const responseData = JSON.parse(responseJSON);
    return { deck: responseData, success: true };

  } catch (error: any) {
    console.error("Erro na análise da IA:", error);
    return { error: `Ocorreu um erro ao comunicar com a IA: ${error.message || 'Erro desconhecido.'}`, success: false };
  }
}
// ============================================================================
// --- AÇÃO PARA GUARDAR O DECK GERADO (ATUALIZADA E CORRIGIDA) ---
// ============================================================================
export async function saveGeneratedDeck(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('Utilizador não autenticado');
    }

    // 1. Extrai os dados do formulário
    const name = formData.get('name') as string;
    const format = formData.get('format') as string;
    const description = formData.get('description') as string;
    const decklistJSON = formData.get('decklist') as string;
    const decklist: Decklist = JSON.parse(decklistJSON);

    // 2. Calcula a identidade de cor e a imagem representativa
    const allCardNames = [...new Set([...decklist.mainboard.map(c => c.name), ...(decklist.sideboard || []).map(c => c.name)])];
    const scryfallData = await fetchCardsByNames(allCardNames);
    
    const colorIdentitySet = new Set<string>();
    scryfallData.forEach(card => card.color_identity.forEach(color => colorIdentitySet.add(color)));
    const color_identity = Array.from(colorIdentitySet);

    // Identifica o comandante se o formato for Commander
    let commander_name: string | null = null; // ✨ Usa o nome de variável correto
    if (format.toLowerCase() === 'commander' && decklist.mainboard.length > 0) {
        commander_name = decklist.mainboard[0].name;
    }

    // Obtém a imagem representativa
    let representative_card_image_url = null;
    const firstCardName = decklist.mainboard[0]?.name;
    if (firstCardName) {
        const cardData = scryfallData.find(c => c.name === firstCardName);
        representative_card_image_url = cardData?.image_uris?.art_crop || cardData?.image_uris?.normal || null;
    }

    // 3. Insere o novo deck na base de dados com todos os campos corretos
    const { data: newDeck, error } = await supabase
        .from('decks')
        .insert({
            user_id: user.id,
            name,
            format,
            description,
            decklist,
            is_public: false, 
            color_identity,
            representative_card_image_url,
            commander_name, // ✨ CORREÇÃO: Guarda na coluna 'commander_name'
        })
        .select('id, format')
        .single();
    
    if (error) {
        console.error("Erro ao guardar o deck gerado pela IA:", error);
        throw new Error('Não foi possível guardar o deck na base de dados.');
    }

    // 4. Revalida o cache e redireciona
    revalidatePath('/my-decks');
    redirect(`/my-deck/${newDeck.format}/${newDeck.id}`);
}