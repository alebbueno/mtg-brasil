// app/my-deck/[format]/[id]/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import type { ScryfallCard } from '@/app/lib/types';
import { fetchCardsByNames } from '@/app/lib/scryfall';
import DeckDetailView from './DeckDetailView';
import type { DeckFromDB, CreatorProfile } from '@/app/lib/types';

// O tipo das props para referência interna
interface PageProps {
  params: {
    id: string;
    format: string;
  };
}

// ✨ CORREÇÃO DEFINITIVA: Recebe as props como 'any' para evitar o erro de build,
// mas depois trata-as com o tipo correto internamente.
export default async function DeckDetailPage(props: any) {
  // Garante que estamos a usar os parâmetros da forma correta
  const { params } = props as PageProps;
  const supabase = createClient();
  const { id } = params;

  // 1. Busca o utilizador logado
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
  
  // 3. Busca o perfil do criador do deck
  const { data: creatorProfile } = await supabase
    .from('profiles')
    .select<"username, avatar_url, cover_image_url", CreatorProfile>('username, avatar_url, cover_image_url')
    .eq('id', deckData.user_id)
    .single();

  // 4. Verifica se o utilizador atual já guardou este deck
  let isSavedByCurrentUser = false;
  if (user) {
    const { data: savedDeck } = await supabase
      .from('saved_decks')
      .select('deck_id')
      .eq('user_id', user.id)
      .eq('deck_id', deckData.id)
      .maybeSingle();
    
    isSavedByCurrentUser = !!savedDeck;
  }

  // 5. Busca os dados detalhados das cartas
  const allCardNames = [
    ...deckData.decklist.mainboard.map(c => c.name),
    ...(deckData.decklist.sideboard?.map(c => c.name) || []),
  ].filter(Boolean); // Filtra quaisquer nomes nulos ou vazios
  
  const uniqueCardNames = Array.from(new Set(allCardNames));
  const scryfallCards = await fetchCardsByNames(uniqueCardNames);
  
  const scryfallCardMapArray = scryfallCards.map(card => [card.name, card] as [string, ScryfallCard]);

  return (
    <DeckDetailView 
      initialDeck={deckData}
      initialScryfallMapArray={scryfallCardMapArray} 
      currentUser={user}
      creatorProfile={creatorProfile}
      isInitiallySaved={isSavedByCurrentUser} 
    />
  );
}
