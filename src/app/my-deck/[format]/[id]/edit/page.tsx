import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { fetchCardsByNames } from '@/app/lib/scryfall';
import type { DeckFromDB } from '@/app/lib/types';
import DeckEditView from './DeckEditView';

export default async function DeckEditPage(props: any) {
  const { params } = props as { params: { format: string; id: string } };
  const supabase = createClient();
  const { id } = params;

  const { data: { user } } = await supabase.auth.getUser();
  const { data: deck, error } = await supabase
    .from('decks')
    .select<"*", DeckFromDB>("*")
    .eq('id', id)
    .single();

  if (error || !deck || !user || user.id !== deck.user_id) {
    notFound();
  }

  const allCardNames = [
    ...deck.decklist.mainboard.map((c) => c.name),
    ...(deck.decklist.sideboard?.map((c) => c.name) || []),
  ];
  const uniqueCardNames = Array.from(new Set(allCardNames));
  const scryfallCards = await fetchCardsByNames(uniqueCardNames);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-400">
            Editar Deck
          </h1>
          <p className="text-lg text-neutral-300 mt-2">
            Ajuste a sua estratégia e refina a sua lista.
          </p>
        </header>

        <DeckEditView
          initialDeck={deck}
          initialScryfallCards={scryfallCards}
        />
      </div>
    </div>
  );
}
