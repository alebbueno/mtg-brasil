/* eslint-disable no-undef */
/* eslint-disable no-console */
import { DeckData } from '@/app/(site)/components/home/DailyDeckItem';
import { supabaseServiceClient } from '@/app/(site)/lib/supabase';
import { fetchCardByName, fetchCardsByNames } from '@/app/(site)/lib/scryfall';
import OpenAI from 'openai';
import { format } from 'date-fns';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface DailyDeckRecord {
  id: number;
  date: string;
  format: 'commander' | 'pauper' | 'modern';
  deck_id: string;
  name: string;
  representative_card_name: string;
  representative_card_image_url: string;
  decklist: {
    mainboard: { name: string; count: number }[];
    sideboard?: { name: string; count: number }[];
  };
  price: number;
  created_at: string;
}

interface OpenAIDeckResponse {
  name: string;
  format: 'commander' | 'pauper' | 'modern';
  representativeCard: { name: string };
  decklist: {
    mainboard: { name: string; count: number }[];
    sideboard?: { name: string; count: number }[];
  };
  strategy: string;
}

export async function getDailyDecks(date: Date = new Date()): Promise<DeckData[]> {
  const dateStr = format(date, 'yyyy-MM-dd');
  console.log('Buscando decks para:', dateStr);

  const { data: existingDecks, error } = await supabaseServiceClient
    .from('daily_decks')
    .select('*')
    .eq('date', dateStr);

  if (error) {
    console.error('Erro ao buscar decks:', error);
    throw new Error('Failed to fetch daily decks');
  }

  console.log('Decks encontrados no Supabase:', existingDecks);

  if (existingDecks.length === 3) {
    const mappedDecks = existingDecks.map((deck: DailyDeckRecord) => ({
      id: deck.deck_id,
      name: deck.name,
      format: deck.format,
      representativeCard: {
        name: deck.representative_card_name,
        imageUrl: deck.representative_card_image_url,
      },
      decklist: deck.decklist,
      price: deck.price,
    }));
    console.log('Decks mapeados:', mappedDecks);
    return mappedDecks;
  }

  const newDecks = await generateDailyDecks();
  console.log('Novos decks gerados:', newDecks);

  for (const deck of newDecks) {
    const { error: insertError } = await supabaseServiceClient
      .from('daily_decks')
      .insert({
        date: dateStr,
        format: deck.format,
        deck_id: deck.id,
        name: deck.name,
        representative_card_name: deck.representativeCard.name,
        representative_card_image_url: deck.representativeCard.imageUrl,
        decklist: deck.decklist,
        price: deck.price,
      });

    if (insertError) {
      console.error('Erro ao inserir deck:', insertError);
      throw new Error('Failed to insert daily deck');
    }
  }

  return newDecks;
}

async function generateDailyDecks(): Promise<DeckData[]> {
  const formats = ['commander', 'pauper', 'modern'] as const;
  const decks: DeckData[] = [];

  for (const format of formats) {
    const deck = await generateDeckForFormat(format);
    const decklist = deck.decklist;
    const price = await calculateDeckPrice(decklist);

    decks.push({
      id: deck.name.toLowerCase().replace(/\s/g, '-') + '-' + format,
      name: deck.name,
      format,
      representativeCard: {
        name: deck.representativeCard.name,
        imageUrl: (await fetchCardByName(deck.representativeCard.name)).image_uris?.normal || 'https://via.placeholder.com/146x204',
      },
      decklist,
      price,
    });
  }

  return decks;
}

async function generateDeckForFormat(format: 'commander' | 'pauper' | 'modern'): Promise<OpenAIDeckResponse> {
  const prompt = `
You are an expert in Magic: The Gathering deckbuilding. Generate a deck for the ${format.toUpperCase()} format that is legal, thematic, and optimized for casual play (Bracket 3 for Commander, competitive but accessible for Pauper/Modern). Ensure:
- All cards are legal in ${format.toUpperCase()} (check MTG banlist).
- Commander: Exactly 100 cards (1 commander, 99 mainboard, no sideboard).
- Pauper: 60 mainboard, 15 sideboard, all common rarity.
- Modern: 60 mainboard, 15 sideboard, no banned cards.
- Include 30-40 lands for Commander, 20-24 for Pauper/Modern.
- Provide a unique deck name and a representative card.
Output in JSON format, without Markdown code blocks:
{
  "name": "Deck Name",
  "format": "${format}",
  "representativeCard": { "name": "Card Name" },
  "decklist": {
    "mainboard": [{ "name": "Card Name", "count": 1 }, ...],
    "sideboard": ${format === 'commander' ? '[]' : '[{ "name": "Card Name", "count": 1 }, ...]'}
  },
  "strategy": "Brief strategy description"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Always return valid JSON without Markdown or extra formatting.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    let content = response.choices[0].message.content || '{}';
    content = content.replace(/```json\n|```/g, '').trim();

    const deckData = JSON.parse(content) as OpenAIDeckResponse;

    if (!deckData.name || !deckData.representativeCard?.name || !deckData.decklist?.mainboard) {
      throw new Error('Invalid deck data from OpenAI');
    }

    const cardNames = [
      deckData.representativeCard.name,
      ...deckData.decklist.mainboard.map(c => c.name),
      ...(deckData.decklist.sideboard?.map(c => c.name) || []),
    ];
    const cards = await fetchCardsByNames(cardNames);
    const invalidCards = cards.filter(card => !card.legalities[format]);
    if (invalidCards.length > 0) {
      throw new Error(`Invalid cards for ${format}: ${invalidCards.map(c => c.name).join(', ')}`);
    }

    return deckData;
  } catch (error) {
    console.error(`Error generating ${format} deck:`, error);
    return getFallbackDeck(format);
  }
}

async function calculateDeckPrice(decklist: OpenAIDeckResponse['decklist']): Promise<number> {
  let totalPrice = 0;
  const cards = [
    ...decklist.mainboard,
    ...(decklist.sideboard || []),
  ];

  for (const { name, count } of cards) {
    const card = await fetchCardByName(name);
    const price = parseFloat(card.prices.usd || '0') || 0;
    totalPrice += price * count;
  }

  return totalPrice;
}

function getFallbackDeck(format: 'commander' | 'pauper' | 'modern'): OpenAIDeckResponse {
  return {
    name: `Fallback ${format} Deck`,
    format,
    representativeCard: { name: format === 'commander' ? 'Bello, Bard of the Brambles' : 'Lightning Bolt' },
    decklist: {
      mainboard: [
        { name: 'Mountain', count: 20 },
        { name: format === 'commander' ? 'Bello, Bard of the Brambles' : 'Lightning Bolt', count: format === 'commander' ? 1 : 4 },
      ],
      sideboard: format !== 'commander' ? [{ name: 'Shock', count: 15 }] : [],
    },
    strategy: `Basic ${format} strategy`,
  };
}