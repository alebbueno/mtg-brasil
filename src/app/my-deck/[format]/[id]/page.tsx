// app/my-deck/[format]/[id]/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { fetchCardsByNames, ScryfallCard } from '@/app/lib/scryfall';
import DeckDetailView from './DeckDetailView'; // Importa o novo componente de cliente

// Tipos de dados necessários para a busca no servidor
interface DeckCard {
  count: number;
  name: string;
}
interface Decklist {
  mainboard: DeckCard[];
  sideboard?: DeckCard[];
}
interface DeckFromDB {
  id: string;
  user_id: string;
  name: string;
  format: string;
  description: string | null;
  decklist: Decklist;
  is_public: boolean;
  representative_card_image_url: string | null;
}

export default async function DeckDetailPage({
  params,
}: {
  params: {
    format: string;
    id: string;
  };
}) {
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

  // A política de segurança (RLS) já filtra o acesso, então se houver um erro,
  // significa que o deck não existe ou o utilizador não tem permissão.
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
  
  // Cria um mapa para ser passado para o componente de cliente.
  // Importante: Não podemos passar um `Map` diretamente para um componente de cliente.
  // Precisamos de o converter num array de arrays ou num objeto.
  const scryfallCardMapArray = Array.from(new Map<string, ScryfallCard>(
    scryfallCards.map(card => [card.name, card])
  ));

  return (
    <DeckDetailView 
      initialDeck={deckData}
      // Passa os dados como um array, para serem reconstruídos como um Map no cliente
      initialScryfallMap={new Map(scryfallCardMapArray)}
      currentUser={user}
    />
  );
}
