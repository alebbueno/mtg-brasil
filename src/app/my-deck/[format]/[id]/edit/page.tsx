/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { fetchCardsByNames } from '@/app/lib/scryfall';
import type { DeckFromDB } from '@/app/lib/types';
import DeckEditView from './DeckEditView';
import type { ScryfallCard } from '@/app/lib/scryfall';

interface DeckEditPageProps {
  params: {
    format: string;
    id: string;
  };
}

export default async function DeckEditPage({ params }: DeckEditPageProps): Promise<JSX.Element> {
  const { format, id } = params;

  const supabase = createClient();

  // Busca usuário autenticado
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    // Usuário não autenticado, redirecionar ou mostrar 404
    return notFound();
  }

  // Busca o deck pelo id
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .single();

  if (deckError || !deck || deck.user_id !== user.id) {
    // Deck não encontrado ou não pertence ao usuário
    return notFound();
  }

  // Extrai nomes válidos das cartas do deck (mainboard + sideboard)
  const allCardNames = [
    ...(deck.decklist?.mainboard?.map((c: { name: string }) => c.name) ?? []),
    ...(deck.decklist?.sideboard?.map((c: { name: string }) => c.name) ?? []),
  ];

  const uniqueValidNames = Array.from(
    new Set(
      allCardNames.filter((name): name is string => typeof name === 'string' && name.trim() !== '')
    )
  );

  // Busca detalhes das cartas via Scryfall
  const scryfallCards: ScryfallCard[] = await fetchCardsByNames(uniqueValidNames);
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-400">Editar Deck</h1>
          <p className="text-lg text-neutral-300 mt-2">Ajuste a sua estratégia e refine a sua lista.</p>
        </header>

        <DeckEditView initialDeck={deck} initialScryfallCards={scryfallCards} />
      </div>
    </main>
  );
}
