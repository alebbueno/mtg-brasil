/* eslint-disable no-console */
/* eslint-disable no-undef */
// src/app/(site)/decksage/[id]/page.tsx

import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import type { DeckFromDB, ScryfallCard } from '@/app/lib/types';
import { fetchCardsByNames } from '@/app/lib/scryfall';

import DeckHeader from '../components/DeckHeader';
import DeckPageNav from '../components/DeckPageNav'; 
import DecklistVisualizer from '../components/DecklistVisualizer';
import DeckAnalysis from '../components/DeckAnalysis';
import HowToPlayGuide from '../components/HowToPlayGuide';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function SiteDeckPage(props: any) {
  // ✅ Fazemos o cast corretamente para evitar erro de build
  const { params } = props as PageProps;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: deck, error } = await supabase
    .rpc('get_public_deck_details', { p_deck_id: params.id })
    .single<DeckFromDB>();

  if (error || !deck) {
    console.error("Erro ao buscar deck público:", error);
    notFound();
  }

  const allCardNames = [
    ...(deck.decklist.commander || []),
    ...deck.decklist.mainboard,
    ...(deck.decklist.sideboard || [])
  ].map((c: any) => c.name);

  const scryfallCards = await fetchCardsByNames([...new Set(allCardNames)]);
  const cardDataMap = new Map(scryfallCards.map((c: ScryfallCard) => [c.name, c]));

  let isInitiallySaved = false;
  if (user) {
    const { data: savedDeck } = await supabase
      .from('saved_decks')
      .select('deck_id')
      .eq('user_id', user.id)
      .eq('deck_id', deck.id)
      .maybeSingle();

    isInitiallySaved = !!savedDeck;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="container mx-auto px-6 py-8">
        <DeckHeader
          deck={deck}
          isOwner={false}
          isInitiallySaved={isInitiallySaved}
        />
        
        {/* Navegação fixa moderna */}
        <DeckPageNav />

        {/* Conteúdo da página */}
        <main className="space-y-12">
          <section id="decklist">
            <DecklistVisualizer 
              decklist={deck.decklist} 
              cardDataMap={cardDataMap}
            />
          </section>

          <section id="analysis">
            <DeckAnalysis deckCheck={deck.deck_check} />
          </section>

          <section id="guide">
            <HowToPlayGuide guideText={deck.how_to_play_guide} />
          </section>
        </main>
      </div>
    </div>
  );
}
