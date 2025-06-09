/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/app/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import { fetchCardsByNames, ScryfallCard } from '@/app/lib/scryfall';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Droplets, Globe, Lock, Loader2, Frown } from 'lucide-react';
import { DeckPrivacyToggle } from '@/app/components/deck/DeckPrivacyToggle';
import { Button } from '@/components/ui/button';
import type { NextPage } from 'next';

// --- Tipos de Dados ---
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
  created_at: string;
}

// --- Sub-componente para a Lista de Cartas ---
function CardListSection({ 
  title, 
  cards, 
  totalCount, 
  onCardHover 
}: { 
  title: string; 
  cards: Record<string, { card: ScryfallCard; count: number }[]>; 
  totalCount: number;
  onCardHover: (imageUrl: string | null) => void;
}) {
  if (totalCount === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-amber-400 mb-4">{title} ({totalCount})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
        {Object.entries(cards).map(([type, cardList]) => (
          <div key={type} className="break-inside-avoid">
            <h3 className="text-lg font-semibold text-neutral-300 mb-2">{type} ({cardList.reduce((acc, c) => acc + c.count, 0)})</h3>
            <ul className="space-y-1">
              {cardList.sort((a,b) => a.card.name.localeCompare(b.card.name)).map(({ card, count }) => (
                <li 
                  key={card.id} 
                  className="text-neutral-200 hover:bg-neutral-800 p-1 rounded-md cursor-pointer flex justify-between items-center text-sm"
                  onMouseEnter={() => onCardHover(card.image_uris?.normal || null)}
                  onMouseLeave={() => onCardHover(null)}
                >
                  <span>{count}x {card.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Componente Principal da Página ---
interface DeckDetailPageProps {
  params: {
    format: string;
    id: string;
  };
}

const DeckDetailPage: NextPage<DeckDetailPageProps> = ({
  params,
}: DeckDetailPageProps) => {
  const supabase = createClient();
  const router = useRouter();
  const { id } = params;

  // Estados para gerir os dados, o carregamento e a interatividade
  const [user, setUser] = useState<User | null>(null);
  const [deck, setDeck] = useState<DeckFromDB | null>(null);
  const [scryfallCardMap, setScryfallCardMap] = useState<Map<string, ScryfallCard>>(new Map());
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Lógica para buscar os dados, agora dentro de um useEffect
  const fetchDeckData = useCallback(async (_loggedInUser: User) => {
    const { data: deckData, error: deckError } = await supabase
      .from('decks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (deckError || !deckData) {
      console.error(`Deck não encontrado ou sem permissão (ID: ${id}):`, deckError);
      setNotFoundError(true);
      setLoading(false);
      return;
    }
    
    setDeck(deckData);
    setPreviewImageUrl(deckData.representative_card_image_url);

    const allCardNames = [
      ...deckData.decklist.mainboard.map(c => c.name),
      ...(deckData.decklist.sideboard?.map(c => c.name) || []),
    ];
    const uniqueCardNames = Array.from(new Set(allCardNames));
    const scryfallCards = await fetchCardsByNames(uniqueCardNames);
    
    setScryfallCardMap(new Map(scryfallCards.map(card => [card.name, card])));
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchDeckData(user);
      } else {
        router.push('/login');
      }
    };
    checkUserAndFetchData();
  }, [router, fetchDeckData, supabase]);

  const handleCardHover = (imageUrl: string | null) => {
    setPreviewImageUrl(imageUrl || deck?.representative_card_image_url || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      </div>
    );
  }

  if (notFoundError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-300">
        <Frown className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-4xl font-bold">404 - Deck Não Encontrado</h1>
        <p className="mt-2">O deck que procura não existe ou não tem permissão para o ver.</p>
        <Button onClick={() => router.push('/my-decks')} className="mt-6">Voltar para Meus Decks</Button>
      </div>
    );
  }

  if (!deck) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-950">Deck não carregado.</div>;
  }

  // Agrupa as cartas após os dados serem carregados
  const groupCardsByType = (deckCards: DeckCard[]) => {
    const grouped: Record<string, { card: ScryfallCard; count: number }[]> = {};
    deckCards.forEach(deckCard => {
      const cardData = scryfallCardMap.get(deckCard.name);
      if (!cardData) return;
      let mainType = "Outros";
      if (cardData.type_line.includes("Creature")) mainType = "Criaturas";
      else if (cardData.type_line.includes("Land")) mainType = "Terrenos";
      else if (cardData.type_line.includes("Instant")) mainType = "Mágicas Instantâneas";
      else if (cardData.type_line.includes("Sorcery")) mainType = "Feitiços";
      else if (cardData.type_line.includes("Artifact")) mainType = "Artefatos";
      else if (cardData.type_line.includes("Enchantment")) mainType = "Encantamentos";
      else if (cardData.type_line.includes("Planeswalker")) mainType = "Planeswalkers";
      if (!grouped[mainType]) grouped[mainType] = [];
      grouped[mainType].push({ card: cardData, count: deckCard.count });
    });
    const typeOrder = ["Criaturas", "Planeswalkers", "Mágicas Instantâneas", "Feitiços", "Encantamentos", "Artefatos", "Terrenos", "Outros"];
    return Object.keys(grouped).sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b)).reduce((obj, key) => { 
      obj[key] = grouped[key]; 
      return obj;
    }, {} as typeof grouped);
  };
  
  const mainboardGrouped = groupCardsByType(deck.decklist.mainboard);
  const sideboardGrouped = deck.decklist.sideboard ? groupCardsByType(deck.decklist.sideboard) : {};
  
  const isOwner = user?.id === deck.user_id;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8">
      <div className="max-w-screen-xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-amber-400">{deck.name}</h1>
              <div className="flex items-center gap-2 text-lg text-neutral-400 capitalize">
                <span>{deck.format}</span>
                <span className="text-neutral-600">•</span>
                {deck.is_public ? (
                  <span className="flex items-center gap-1 text-green-400 text-sm"><Globe size={14}/> Público</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400 text-sm"><Lock size={14}/> Privado</span>
                )}
              </div>
            </div>
            {isOwner && (
              <Card className="bg-neutral-800 p-3">
                <DeckPrivacyToggle deckId={deck.id} initialIsPublic={deck.is_public} />
              </Card>
            )}
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          <div className="lg:col-span-3 sticky top-24 self-start">
            <Image
              src={previewImageUrl || 'https://placehold.co/340x475/171717/EAB308?text=Passe+o+rato'}
              alt="Pré-visualização da carta"
              width={340}
              height={475}
              className="rounded-lg shadow-lg mx-auto transition-all duration-300"
            />
          </div>
          <main className="lg:col-span-7 space-y-8">
            <aside className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-500"><BarChart/> Estatísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-400 text-sm">Gráfico da Curva de Mana aqui.</p>
                </CardContent>
              </Card>
              {deck.description && (
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-500"><Droplets/> Primer / Estratégia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert text-neutral-300 whitespace-pre-wrap">{deck.description}</div>
                  </CardContent>
                </Card>
              )}
            </aside>
            <div className="space-y-12">
              <CardListSection 
                title="Mainboard" 
                cards={mainboardGrouped} 
                totalCount={deck.decklist.mainboard.reduce((acc, c) => acc + c.count, 0)}
                onCardHover={handleCardHover}
              />
              <CardListSection 
                title="Sideboard" 
                cards={sideboardGrouped} 
                totalCount={deck.decklist.sideboard?.reduce((acc, c) => acc + c.count, 0) || 0}
                onCardHover={handleCardHover}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DeckDetailPage;