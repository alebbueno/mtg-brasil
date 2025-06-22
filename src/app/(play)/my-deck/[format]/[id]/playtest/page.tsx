import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import { fetchCardsByNames } from '@/app/lib/scryfall';
import PlaytestView from './PlaytestView';
import type { DeckFromDB, ScryfallCard } from '@/app/lib/types';

interface PageProps {
  params: { id: string; format: string; };
}

export default async function PlaytestPage(props: any) {
  const { params } = props as PageProps;
  const supabase = createClient();

  const { data: deckData } = await supabase
    .from('decks')
    .select<"*", DeckFromDB>("*")
    .eq('id', params.id)
    .single();
  
  if (!deckData) {
    notFound();
  }

  const allCardNames = [
    ...(deckData.decklist.mainboard || []).map((c) => c.name),
    ...(deckData.decklist.sideboard || []).map((c) => c.name),
    ...(deckData.decklist.commander || []).map((c) => c.name)
  ];
  
  const uniqueCardNames = [...new Set(allCardNames)] as string[];
  const scryfallCards = await fetchCardsByNames(uniqueCardNames);
  const scryfallCardMapArray = scryfallCards.map(card => [card.name, card] as [string, ScryfallCard]);

  const fullDecklist = [
    ...deckData.decklist.mainboard,
    ...(deckData.decklist.sideboard || [])
  ];

  return (
    <PlaytestView 
      initialDecklist={fullDecklist}
      initialCommanderList={deckData.decklist.commander}
      initialScryfallMapArray={scryfallCardMapArray}
      deckFormat={deckData.format}
    />
  );
}