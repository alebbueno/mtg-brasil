/* eslint-disable no-console */
/* eslint-disable no-undef */
import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import type { DeckFromDB, ScryfallCard } from '@/app/lib/types';
import { fetchCardsByNames } from '@/app/lib/scryfall';

import DeckHeader from '../components/DeckHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutList, BookOpenText, BrainCircuit } from 'lucide-react';

// Importa os componentes da sua nova pasta centralizada
import DecklistVisualizer from '../components/DecklistVisualizer';
import DeckAnalysis from '../components/DeckAnalysis';
import HowToPlayGuide from '../components/HowToPlayGuide';

// Diretiva para forçar a renderização dinâmica e evitar erros de build
export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string; };
}

export default async function SiteDeckPage(props: any) {
  const { params } = props as PageProps;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Chama a nova função RPC, que é mais robusta
  const { data: deck, error } = await supabase
    .rpc('get_public_deck_details', { p_deck_id: params.id })
    .single<DeckFromDB>();

  if (error || !deck) {
    console.error("Erro ao buscar deck público ou não encontrado:", error);
    notFound();
  }

  // 2. Busca os dados completos das cartas para o visualizador
  const allCardNames = [...(deck.decklist.commander || []), ...deck.decklist.mainboard, ...(deck.decklist.sideboard || [])].map((c: any) => c.name);
  const scryfallCards = await fetchCardsByNames([...new Set(allCardNames)]);
  const cardDataMap = new Map(scryfallCards.map((c: ScryfallCard) => [c.name, c]));

  // 3. Verifica se o usuário logado já salvou este deck
  let isInitiallySaved = false;
  if (user) {
    const { data: savedDeck } = await supabase
      .from('saved_decks')
      .select('deck_id')
      .eq('user_id', user.id)
      .eq('deck_id', deck.id)
      .single();
    isInitiallySaved = !!savedDeck;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="container mx-auto px-6 py-8">
        <DeckHeader
          deck={deck as DeckFromDB}
          isOwner={false}
          isInitiallySaved={isInitiallySaved}
        />
        
        <main className="mt-8">
          <Tabs defaultValue="decklist" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto">
                <TabsTrigger value="decklist"><LayoutList className="mr-2 h-4 w-4"/>Decklist</TabsTrigger>
                <TabsTrigger value="analysis"><BookOpenText className="mr-2 h-4 w-4"/>Análise</TabsTrigger>
                <TabsTrigger value="guide"><BrainCircuit className="mr-2 h-4 w-4"/>Guia</TabsTrigger>
            </TabsList>
            
            <TabsContent value="decklist" className="mt-6">
                <DecklistVisualizer 
                    decklist={deck.decklist} 
                    cardDataMap={cardDataMap}
                />
            </TabsContent>

            <TabsContent value="analysis" className="mt-6">
                <DeckAnalysis deckCheck={deck.deck_check} />
            </TabsContent>

            <TabsContent value="guide" className="mt-6">
                <HowToPlayGuide guideText={deck.how_to_play_guide} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}