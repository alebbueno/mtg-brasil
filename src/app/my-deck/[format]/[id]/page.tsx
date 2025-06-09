// app/my-deck/[format]/[id]/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { fetchCardsByNames, ScryfallCard } from '@/app/lib/scryfall';
import DeckDetailView from './DeckDetailView'; // Importa o novo componente de cliente
import type { ReactElement } from 'react'; // Importa o tipo para o retorno da função

// --- Tipos de Dados ---
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

// Componente da página com tipagem explícita nas props e no retorno
export default async function DeckDetailPage({
  params,
}: {
  params: { format: string; id: string };
}): Promise<ReactElement> { // Define explicitamente que a função retorna um elemento React
  const supabase = createClient();
  const { id } = params;

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
