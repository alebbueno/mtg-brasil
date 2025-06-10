// app/my-deck/[format]/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { fetchCardsByNames } from '@/app/lib/scryfall';
import DeckEditView from './DeckEditView';
import type { DeckFromDB } from '@/app/lib/types';

interface PageProps {
  params: {
    id: string;
    format: string;
  };
}

export default async function Page({ params }: PageProps) {
  const supabase = createClient();

  // Pega o usuário autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  // Busca deck pelo id
  const { data: deck, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', params.id)
    .single<DeckFromDB>();

  if (error || !deck || deck.user_id !== user.id) return notFound();

  // Pega os nomes das cartas do deck
  const cardNames = [
    ...(deck.decklist.mainboard?.map((c) => c.name) ?? []),
    ...(deck.decklist.sideboard?.map((c) => c.name) ?? []),
  ].filter((name): name is string => !!name && name.trim() !== '');

  // Busca dados das cartas na API
  const scryfallCards = await fetchCardsByNames([...new Set(cardNames)]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-400">
            Editar Deck
          </h1>
          <p className="text-lg text-neutral-300 mt-2">
            Ajuste a sua estratégia e refine sua lista.
          </p>
        </header>
        <DeckEditView initialDeck={deck} initialScryfallCards={scryfallCards} />
      </div>
    </div>
  );
}
