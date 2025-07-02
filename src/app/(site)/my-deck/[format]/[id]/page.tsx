/* eslint-disable no-undef */
/* eslint-disable no-console */
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import type { ScryfallCard } from '@/app/lib/types';
import { fetchCardsByNames } from '@/app/lib/scryfall';
import DeckDetailView from './DeckDetailView';
import type { DeckFromDB, CreatorProfile } from '@/app/lib/types';

interface PageProps {
  params: {
    id: string;
    format: string;
  };
}

export default async function DeckDetailPage(props: any) {
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

  // AJUSTE 1: Lógica de Segurança Aprimorada
  // A página só é acessível se o deck for público OU se o usuário logado for o dono.
  const isOwner = user?.id === deckData.user_id;
  if (!deckData.is_public && !isOwner) {
    notFound();
  }
  
  // AJUSTE 2: Incrementa a contagem de views
  // Apenas se houver um visitante ou se o visitante não for o dono do deck.
  if (!isOwner) {
    // Chamamos a função RPC em segundo plano ("fire-and-forget").
    // Não usamos 'await' para não atrasar o carregamento da página.
    supabase.rpc('increment_deck_view_count', { deck_id_to_update: deckData.id }).then(({ error }) => {
        if(error) console.error(`Erro ao incrementar view count para o deck ${deckData.id}:`, error);
    });
  }

  // 3. Busca o perfil do criador do deck (lógica mantida)
  const { data: creatorProfile } = await supabase
    .from('profiles')
    .select<"id, username, avatar_url, cover_image_url", CreatorProfile>('id, username, avatar_url, cover_image_url')
    .eq('id', deckData.user_id)
    .single();

  // 4. Verifica se o utilizador atual já guardou este deck (lógica mantida)
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

  // 5. Busca os dados detalhados das cartas (lógica mantida)
  const allCardNames = [
    ...(deckData.decklist.commander || []).map(c => c.name),
    ...deckData.decklist.mainboard.map(c => c.name),
    ...(deckData.decklist.sideboard?.map(c => c.name) || []),
  ].filter(Boolean);
  
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