// app/my-deck/[format]/[id]/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { fetchCardsByNames, type ScryfallCard } from '@/app/lib/scryfall';
import DeckDetailView from './DeckDetailView'; 
import type { DeckFromDB } from '@/app/lib/types';

export default async function DeckDetailPage({
  params,
}: {
  params: { format: string; id: string };
}) {
  const supabase = createClient();
  const { id, format } = params;

  if (!id || !format) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: deckData, error } = await supabase
    .from('decks')
    .select<"*", DeckFromDB>("*")
    .eq('id', id)
    .single();

  if (error || !deckData) {
    notFound();
  }

  const { data: creatorProfile } = await supabase
    .from('profiles')
    .select('username, avatar_url, cover_image_url')
    .eq('id', deckData.user_id)
    .single();

  const allCardNames = [
    ...deckData.decklist.mainboard.map((c) => c.name),
    ...(deckData.decklist.sideboard?.map((c) => c.name) || []),
  ];
  const uniqueCardNames = Array.from(new Set(allCardNames));
  const scryfallCards = await fetchCardsByNames(uniqueCardNames);

  const scryfallCardMapArray = scryfallCards.map(
    (card) => [card.name, card] as [string, ScryfallCard]
  );

  return (
    <DeckDetailView
      initialDeck={deckData}
      initialScryfallMapArray={scryfallCardMapArray}
      currentUser={user}
      creatorProfile={creatorProfile}
    />
  );
}
