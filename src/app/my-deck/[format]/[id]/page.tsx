// app/my-deck/[format]/[id]/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { fetchCardsByNames, ScryfallCard } from '@/app/lib/scryfall';
import DeckDetailView from './DeckDetailView'; // Importa o novo componente de cliente

// --- Tipos de Dados ---
// É uma boa prática definir os tipos que serão usados em múltiplos locais
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

// Definição de tipo mais explícita para as props da página
type DeckDetailPageProps = {
  params: {
    format: string;
    id: string;
  };
};

export default async function DeckDetailPage({ params }: DeckDetailPageProps) {
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
  // Isto é mais seguro para passar para Componentes de Cliente do que um objeto Map.
  const scryfallCardMapArray = scryfallCards.map(card => [card.name, card] as [string, ScryfallCard]);

  return (
    <DeckDetailView 
      initialDeck={deckData}
      // Passa o array serializável em vez de um objeto Map
      initialScryfallMapArray={scryfallCardMapArray} 
      currentUser={user}
    />
  );
}
