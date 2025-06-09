// app/my-deck/[format]/[id]/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { fetchCardsByNames, ScryfallCard } from '@/app/lib/scryfall';
import DeckDetailView from './DeckDetailView'; 
import type { ReactElement } from 'react';

// --- Tipos de Dados (mantidos para uso interno) ---
export interface DeckCard {
  count: number;
  name: string;
}
export interface Decklist {
  mainboard: DeckCard[];
  sideboard?: DeckCard[];
}
export interface DeckFromDB {
  id: string;
  user_id: string;
  name: string;
  format: string;
  description: string | null;
  decklist: Decklist;
  is_public: boolean;
  representative_card_image_url: string | null;
}

// *** ALTERAÇÃO PRINCIPAL: Usando 'any' para as props como passo de depuração ***
// Isto diz ao TypeScript para não verificar os tipos das props, o que pode contornar
// o erro de compilação se ele for causado por uma inferência de tipo incorreta.
export default async function DeckDetailPage({ params }: any): Promise<ReactElement> { 
  const supabase = createClient();
  // Extraímos os parâmetros de forma segura, mesmo com 'any'
  const id = params?.id as string;
  const format = params?.format as string;

  if (!id || !format) {
    // Se os parâmetros não existirem, não podemos continuar
    notFound();
  }

  // 1. Busca o utilizador logado para verificar permissões
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Busca os dados do deck
  const { data: deckData, error } = await supabase
    .from('decks')
    .select<"*", DeckFromDB>("*")
    .eq('id', id)
    .single();

  if (error || !deckData) {
    notFound();
  }

  // 3. Busca os dados detalhados das cartas no Scryfall
  const allCardNames = [
    ...deckData.decklist.mainboard.map(c => c.name),
    ...(deckData.decklist.sideboard?.map(c => c.name) || []),
  ];
  const uniqueCardNames = Array.from(new Set(allCardNames));
  const scryfallCards = await fetchCardsByNames(uniqueCardNames);
  
  // Cria um array de arrays [key, value] que é serializável.
  const scryfallCardMapArray = scryfallCards.map(card => [card.name, card] as [string, ScryfallCard]);

  return (
    <DeckDetailView 
      initialDeck={deckData}
      initialScryfallMapArray={scryfallCardMapArray} 
      currentUser={user}
    />
  );
}
