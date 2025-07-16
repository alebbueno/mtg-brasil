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

// Validação de variáveis de ambiente
if (!process.env.OPENAI_API_KEY && !process.env.GOOGLE_API_KEY) {
  throw new Error('Nenhuma chave de API de IA configurada.');
}

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
  if (!rawResponse) {
    console.warn('Resposta da IA vazia');
    return '{}';
  }
  const startIndex = rawResponse.indexOf('{');
  const endIndex = rawResponse.lastIndexOf('}');
  if (startIndex === -1 || endIndex === -1) {
    console.warn('Resposta da IA não contém JSON válido:', rawResponse);
    return '{}';
  }
  const jsonString = rawResponse.substring(startIndex, endIndex + 1);
  try {
    JSON.parse(jsonString);
    return jsonString;
  } catch {
    console.warn('JSON inválido após limpeza:', jsonString);
    return '{}';
  }
};

const formatRules: Record<string, { mainboardSize: number; maxCopies: number; singleton: boolean }> = {
  commander: { mainboardSize: 99, maxCopies: 1, singleton: true },
  standard: { mainboardSize: 60, maxCopies: 4, singleton: false },
  pioneer: { mainboardSize: 60, maxCopies: 4, singleton: false },
  modern: { mainboardSize: 60, maxCopies: 4, singleton: false },
  pauper: { mainboardSize: 60, maxCopies: 4, singleton: false },
};

// Função para preencher o deck com terrenos básicos
const fillBasicLands = (mainboard: CoreCard[], colorIdentity: string[]): CoreCard[] => {
  const basicLands: Record<string, string> = {
    W: 'Plains',
    U: 'Island',
    B: 'Swamp',
    R: 'Mountain',
    G: 'Forest',
  };
  const applicableLands = colorIdentity
    .filter(color => basicLands[color])
    .map(color => ({ name: basicLands[color], count: 0 }));
  
  if (applicableLands.length === 0) {
    applicableLands.push({ name: 'Swamp', count: 0 });
  }

  const mainboardCount = mainboard.reduce((sum, card) => sum + card.count, 0);
  if (mainboardCount >= 99) return mainboard;

  const cardsNeeded = 99 - mainboardCount;
  const landsPerColor = Math.floor(cardsNeeded / applicableLands.length);
  const extraLands = cardsNeeded % applicableLands.length;

  applicableLands.forEach((land, index) => {
    land.count = landsPerColor + (index < extraLands ? 1 : 0);
  });

  const updatedMainboard = [...mainboard];
  applicableLands.forEach(land => {
    const existingLand = updatedMainboard.find(card => card.name === land.name);
    if (existingLand) {
      existingLand.count += land.count;
    } else {
      updatedMainboard.push(land);
    }
  });

  return updatedMainboard;
};

// Função para preencher com criaturas genéricas
const fillGenericCreatures = async (mainboard: CoreCard[], colorIdentity: string[], cardsNeeded: number): Promise<CoreCard[]> => {
  const genericCreatures: Record<string, string[]> = {
    W: ['Savannah Lions', 'Elite Vanguard'],
    U: ['Merfolk Looter', 'Cloudkin Seer'],
    B: ['Vampire Spawn', 'Foulmire Knight'],
    R: ['Dragon Fodder', 'Goblin Instigator'],
    G: ['Llanowar Elves', 'Elvish Mystic'],
  };

  const applicableCreatures = colorIdentity
    .filter(color => genericCreatures[color])
    .flatMap(color => genericCreatures[color].map(name => ({ name, count: 0 })));
  
  if (applicableCreatures.length === 0) {
    applicableCreatures.push({ name: 'Ornithopter', count: 0 });
  }

  const creaturesPerType = Math.floor(cardsNeeded / applicableCreatures.length);
  const extraCreatures = cardsNeeded % applicableCreatures.length;

  applicableCreatures.forEach((creature, index) => {
    creature.count = creaturesPerType + (index < extraCreatures ? 1 : 0);
  });

  const updatedMainboard = [...mainboard];
  applicableCreatures.forEach(creature => {
    if (creature.count > 0) {
      const existingCreature = updatedMainboard.find(card => card.name === creature.name);
      if (existingCreature) {
        existingCreature.count += creature.count;
      } else {
        updatedMainboard.push(creature);
      }
    }
  });

  return updatedMainboard;
};

/**
 * Constrói um deck de Magic: The Gathering usando IA com base nas entradas do usuário.
 * @param prevState Estado anterior da ação.
 * @param formData Dados do formulário contendo formato, prompt e comandante.
 * @returns Objeto com o deck gerado ou mensagem de erro.
 */
export async function buildUserDeckWithAI(prevState: BuildDeckState, formData: FormData): Promise<BuildDeckState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Você precisa estar logado para usar esta função.' };

  const format = formData.get('format') as string;
  const commanderName = formData.get('commanderName') as string | null;
  const commanderColorIdentityJSON = formData.get('commanderColorIdentity') as string | null;
  const userPrompt = formData.get('user_prompt') as string | null;

  if (!format || !formatRules[format]) return { success: false, error: 'Formato inválido.' };
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
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: 'user', content: finalPrompt }],
        response_format: { type: "json_object" },
      });
      rawJsonResponse = completion.choices[0]?.message?.content;
    }

    if (!rawJsonResponse) return { success: false, error: 'A IA não retornou uma resposta válida. Tente novamente.' };

    const cleanedJson = cleanJsonString(rawJsonResponse);
    const parsedResult = JSON.parse(cleanedJson);

    parsedResult.decklist.mainboard = parseDecklistArray(parsedResult.decklist.mainboard);
    if (parsedResult.decklist.sideboard) parsedResult.decklist.sideboard = parseDecklistArray(parsedResult.decklist.sideboard);

    // Validação e ajuste para Commander
    if (format === 'commander') {
      // Garantir que o comandante seja incluído apenas em decklist.commander
      if (commanderName) {
        parsedResult.decklist.commander = [{ name: commanderName, count: 1 }];
        // Remover o comandante do mainboard, se presente
        parsedResult.decklist.mainboard = parsedResult.decklist.mainboard.filter(
          (card: CoreCard) => card.name !== commanderName
        );
      }

      // Validar identidade de cor
      const allCardNames = parsedResult.decklist.mainboard.map(c => c.name);
      const scryfallData = await fetchCardsByNames(allCardNames);
      const invalidCards = scryfallData.filter(card => 
        !card.color_identity.every((color: string) => commanderColorIdentity?.includes(color) || color === '')
      );
      if (invalidCards.length > 0) {
        return { success: false, error: `O deck contém cartas (${invalidCards.map(c => c.name).join(', ')}) fora da identidade de cor do comandante [${commanderColorIdentity?.join(', ')}]. Tente novamente.` };
      }

      // Validar número de criaturas
      let creatureCount = 0;
      scryfallData.forEach(card => {
        if (card.type_line.toLowerCase().includes('creature')) {
          const cardInMainboard = parsedResult.decklist.mainboard.find(c => c.name === card.name);
          if (cardInMainboard) creatureCount += cardInMainboard.count;
        }
      });
      if (creatureCount < 20) {
        const creaturesNeeded = 20 - creatureCount;
        parsedResult.decklist.mainboard = await fillGenericCreatures(parsedResult.decklist.mainboard, commanderColorIdentity || ['B'], creaturesNeeded);
      }

      // Validar e ajustar número de cartas no mainboard (excluindo comandante)
      let mainboardCount = parsedResult.decklist.mainboard.reduce((sum: number, card: CoreCard) => sum + card.count, 0);
      if (mainboardCount !== 99) {
        if (mainboardCount < 50) {
          return { success: false, error: `O deck Commander contém apenas ${mainboardCount} cartas no mainboard, muito abaixo das 99 exigidas. Tente ajustar sua instrução ou gerar novamente.` };
        }
        if (mainboardCount > 99) {
          parsedResult.decklist.mainboard.sort((a: CoreCard, b: CoreCard) => a.count - b.count);
          while (mainboardCount > 99 && parsedResult.decklist.mainboard.length > 0) {
            const card = parsedResult.decklist.mainboard[0];
            if (card.count > 1) {
              card.count -= 1;
            } else {
              parsedResult.decklist.mainboard.shift();
            }
            mainboardCount = parsedResult.decklist.mainboard.reduce((sum: number, c: CoreCard) => sum + c.count, 0);
          }
        }
        if (mainboardCount < 99) {
          parsedResult.decklist.mainboard = fillBasicLands(parsedResult.decklist.mainboard, commanderColorIdentity || ['B']);
          mainboardCount = parsedResult.decklist.mainboard.reduce((sum: number, c: CoreCard) => sum + c.count, 0);
        }
        if (mainboardCount !== 99) {
          return { success: false, error: `Não foi possível ajustar o deck para conter exatamente 99 cartas no mainboard (contém ${mainboardCount}). Tente novamente.` };
        }
      }
    }

    return { success: true, deck: parsedResult };

  } catch (error) {
    console.error('Erro na API de IA (Usuário):', error);
    const errorMessage =
      error instanceof OpenAI.APIError
        ? 'Falha na comunicação com a API de IA. Tente novamente mais tarde.'
        : error instanceof SyntaxError
        ? 'Resposta da IA em formato inválido. Tente novamente.'
        : 'Ocorreu um erro ao construir o deck. Tente novamente.';
    return { success: false, error: errorMessage };
  }
}

/**
 * Salva o deck gerado no banco de dados e redireciona para a página de decks.
 * @param formData Dados do formulário contendo nome, formato, descrição, decklist e comandante.
 * @returns Objeto com estado de sucesso ou erro, ou redireciona em caso de sucesso.
 */
export async function saveUserDeck(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Você precisa estar logado para salvar o deck.' };

  const name = formData.get('name') as string;
  const format = formData.get('format') as string;
  const description = formData.get('description') as string;
  const decklistJSON = formData.get('decklist') as string;
  const commanderName = formData.get('commanderName') as string;

  if (!name || !format || !description || !decklistJSON) {
    return { success: false, error: 'Dados do formulário incompletos.' };
  }

  try {
    const decklist: Decklist = JSON.parse(decklistJSON);
    if (commanderName && format === 'commander') {
      decklist.commander = [{ name: commanderName, count: 1 }];
    }

    const allCardNames = [...new Set([...(decklist.commander || []), ...decklist.mainboard, ...(decklist.sideboard || [])].map(c => c.name))];
    const scryfallData = await fetchCardsByNames(allCardNames);

    // Calcular identidade de cor
    const colorIdentitySet = new Set<string>();
    const commanderCard = commanderName ? scryfallData.find(c => c.name === commanderName) : null;
    if (format === 'commander' && commanderCard) {
      commanderCard.color_identity.forEach(color => colorIdentitySet.add(color));
    } else {
      scryfallData
        .filter(card => !card.type_line.toLowerCase().includes('land'))
        .forEach(card => card.color_identity.forEach(color => colorIdentitySet.add(color)));
    }

    // Obter a imagem representativa
    let representative_card_image_url = commanderCard?.image_uris?.art_crop;
    if (!representative_card_image_url && commanderCard) {
      representative_card_image_url = commanderCard.image_uris?.normal;
    }
    if (!representative_card_image_url) {
      console.warn(`Imagem não encontrada para a carta ${commanderName || allCardNames[0]}`);
      representative_card_image_url = scryfallData.find(c => c.name === allCardNames[0])?.image_uris?.normal || '';
    }

    const { data: newDeck, error } = await supabase
      .from('decks')
      .insert({
        user_id: user.id,
        name,
        format,
        description,
        decklist,
        color_identity: Array.from(colorIdentitySet),
        representative_card_image_url,
        is_public: false,
        source: 'ai_builder_user',
        owner_type: 'user',
      })
      .select('id, format')
      .single();

    if (error) throw error;

    revalidatePath('/my-decks');
    redirect('/my-decks');
  } catch (error) {
    console.error('Erro ao salvar o deck:', error);
    return { success: false, error: 'Falha ao salvar o deck.' };
  }
}