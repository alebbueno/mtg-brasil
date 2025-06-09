// app/my-deck/[format]/[id]/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { fetchCardsByNames, type ScryfallCard } from '@/app/lib/scryfall';
import DeckDetailView from './DeckDetailView'; 
import type { DeckFromDB } from '@/app/lib/types'; // Assumindo que tem um ficheiro central de tipos

// Definição de tipo correta e explícita para as props da página
interface PageProps {
  params: {
    format: string;
    id: string;
  };
}

export default async function DeckDetailPage({ params }: PageProps) {
  const supabase = createClient();
  // A desestruturação aqui é segura, pois os params já foram resolvidos pelo Next.js
  const { id, format } = params;

  if (!id || !format) {
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
  
  // 3. Busca o perfil do criador do deck (se necessário)
  const { data: creatorProfile } = await supabase
    .from('profiles')
    .select('username, avatar_url, cover_image_url')
    .eq('id', deckData.user_id)
    .single();

  // 4. Busca os dados detalhados das cartas
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
      creatorProfile={creatorProfile}
    />
  );
}
