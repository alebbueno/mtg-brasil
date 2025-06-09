/* eslint-disable no-unused-vars */
// app/my-deck/[format]/[id]/DeckDetailView.tsx
'use client'

import { useState, useMemo } from 'react';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';
import type { ScryfallCard } from '@/app/lib/scryfall';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Droplets, Globe, Lock } from 'lucide-react';
import { DeckPrivacyToggle } from '@/app/components/deck/DeckPrivacyToggle';
import type { DeckFromDB, DeckCard } from './page'; // Importa os tipos da página principal

// --- Tipos para as Props deste componente ---
interface DeckDetailViewProps {
  initialDeck: DeckFromDB;
  initialScryfallMapArray: [string, ScryfallCard][];
  currentUser: User | null;
}

// --- Sub-componente para a Lista de Cartas ---
function CardListSection({ 
    title, 
    cards, 
    totalCount, 
    onCardHover,
    onCardLeave
}: { 
    title: string; 
    cards: Record<string, { card: ScryfallCard; count: number }[]>; 
    totalCount: number;
    onCardHover: (imageUrl: string) => void;
    onCardLeave: () => void;
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
                  onMouseEnter={() => onCardHover(card.image_uris?.normal || '')}
                  onMouseLeave={onCardLeave}
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

// --- Componente Principal da Visualização (Cliente) ---
export default function DeckDetailView({ initialDeck, initialScryfallMapArray, currentUser }: DeckDetailViewProps) {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(initialDeck.representative_card_image_url);

  // Recria o Map a partir do array recebido, usando useMemo para performance
  const scryfallCardMap = useMemo(() => new Map(initialScryfallMapArray), [initialScryfallMapArray]);

  const handleCardHover = (imageUrl: string) => {
    if(imageUrl) setPreviewImageUrl(imageUrl);
  };

  const handleCardLeave = () => {
    setPreviewImageUrl(initialDeck.representative_card_image_url);
  };
  
  // Agrupa as cartas usando os dados iniciais recebidos como props
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
  
  const mainboardGrouped = groupCardsByType(initialDeck.decklist.mainboard);
  const sideboardGrouped = initialDeck.decklist.sideboard ? groupCardsByType(initialDeck.decklist.sideboard) : {};
  
  const isOwner = currentUser?.id === initialDeck.user_id;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8">
      <div className="max-w-screen-xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-amber-400">{initialDeck.name}</h1>
              <div className="flex items-center gap-2 text-lg text-neutral-400 capitalize">
                <span>{initialDeck.format}</span>
                <span className="text-neutral-600">&bull;</span>
                {initialDeck.is_public ? (
                  <span className="flex items-center gap-1 text-green-400 text-sm"><Globe size={14}/> Público</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400 text-sm"><Lock size={14}/> Privado</span>
                )}
              </div>
            </div>
            {isOwner && (
              <Card className="bg-neutral-800 p-3">
                <DeckPrivacyToggle deckId={initialDeck.id} initialIsPublic={initialDeck.is_public} />
              </Card>
            )}
          </div>
        </header>

        {/* Layout Principal */}
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
              {initialDeck.description && (
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-500"><Droplets/> Primer / Estratégia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert text-neutral-300 whitespace-pre-wrap">{initialDeck.description}</div>
                  </CardContent>
                </Card>
            )}
            </aside>
            <div className="space-y-12">
              <CardListSection 
                title="Mainboard" 
                cards={mainboardGrouped} 
                totalCount={initialDeck.decklist.mainboard.reduce((acc, c) => acc + c.count, 0)}
                onCardHover={handleCardHover}
                onCardLeave={handleCardLeave}
              />
              <CardListSection 
                title="Sideboard" 
                cards={sideboardGrouped} 
                totalCount={initialDeck.decklist.sideboard?.reduce((acc, c) => acc + c.count, 0) || 0}
                onCardHover={handleCardHover}
                onCardLeave={handleCardLeave}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
