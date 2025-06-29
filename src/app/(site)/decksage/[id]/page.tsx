import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import type { DeckFromDB, ScryfallCard } from '@/app/lib/types';
import { fetchCardsByNames } from '@/app/lib/scryfall';

import DeckHeader from '../components/DeckHeader';
// Importa nosso novo menu de navegação
import DeckPageNav from '../components/DeckPageNav'; 
// Importa os componentes de conteúdo
import DecklistVisualizer from '../components/DecklistVisualizer';
import DeckAnalysis from '../components/DeckAnalysis';
import HowToPlayGuide from '../components/HowToPlayGuide';

export const dynamic = 'force-dynamic';

export default async function SiteDeckPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: deck, error } = await supabase
    .rpc('get_public_deck_details', { p_deck_id: params.id })
    .single<DeckFromDB>();

  if (error || !deck) {
    notFound();
  }

  const allCardNames = [...(deck.decklist.commander || []), ...deck.decklist.mainboard, ...(deck.decklist.sideboard || [])].map((c: any) => c.name);
  const scryfallCards = await fetchCardsByNames([...new Set(allCardNames)]);
  const cardDataMap = new Map(scryfallCards.map((c: ScryfallCard) => [c.name, c]));

  let isInitiallySaved = false;
  if (user) {
    const { data: savedDeck } = await supabase.from('saved_decks').select('deck_id').eq('user_id', user.id).eq('deck_id', deck.id).single();
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
        
        {/* Renderizamos o novo menu de navegação aqui */}
        <DeckPageNav />

        {/* O conteúdo agora é uma lista vertical de seções, cada uma com um ID */}
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