/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
'use client'

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Crown, Star } from 'lucide-react';
import { useMemo } from 'react';
import type { ScryfallCard } from '@/app/lib/types'; 

// --- AJUSTE CRÍTICO: Esta é a definição correta e final ---
// GridCardData herda todas as propriedades de ScryfallCard e adiciona 'count'.
// Isso garante 100% de compatibilidade.
export interface GridCardData extends ScryfallCard {
  count: number;
}

interface DeckGridViewProps {
  commanderCard: GridCardData | null;
  planeswalkerCards: GridCardData[];
  mainboardCards: GridCardData[];
  sideboardCards: GridCardData[];
  onCardHover: (url: string) => void;
  onCardLeave: () => void;
  onPriceFetch: (card: ScryfallCard | null) => void;
}

function GridCardDisplay({ card, onCardHover, onCardLeave, onPriceFetch }: { 
  card: GridCardData, 
  onCardHover: (url: string) => void, 
  onCardLeave: () => void,
  onPriceFetch: (card: GridCardData | null) => void 
}) {
  return (
    <div
      className="relative"
      onMouseEnter={() => {
        onCardHover(card.image_uris?.normal || '');
        onPriceFetch(card);
      }}
      onMouseLeave={() => {
        onCardLeave();
        onPriceFetch(null);
      }}
    >
      <div className="relative cursor-pointer transition-transform duration-200 hover:-translate-y-2 group">
        {card.count > 1 && (
          <Badge
            className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full text-black text-xs font-bold z-10 flex items-center justify-center p-0"
          >
            {card.count}
          </Badge>
        )}
        <Image
          src={card.image_uris?.normal || `https://placehold.co/265x370/171717/EAB308?text=${encodeURIComponent(card.name)}`}
          alt={card.name}
          width={265}
          height={370}
          unoptimized
          className="w-full object-contain aspect-[5/7] rounded-md shadow-lg"
        />
      </div>
    </div>
  );
}

// ... O restante do arquivo (CardGridSection e DeckGridView) continua o mesmo ...
// ... (vou incluir por completo para garantir)

function CardGridSection({ title, cards, onCardHover, onCardLeave, onPriceFetch, icon }: {
  title: string;
  cards: GridCardData[];
  onCardHover: (url: string) => void;
  onCardLeave: () => void;
  onPriceFetch: (card: GridCardData | null) => void;
  icon?: React.ReactNode;
}) {
  const totalCount = cards.reduce((sum, card) => sum + card.count, 0);
  if (totalCount === 0) return null;

  return (
    <div>
      <h3 className="text-xl font-bold text-amber-500 mb-4 border-b border-neutral-800 pb-2 flex items-center gap-2">
        {icon} {title} ({totalCount})
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3">
        {cards
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((card) => (
            <GridCardDisplay key={card.id} card={card} onCardHover={onCardHover} onCardLeave={onCardLeave} onPriceFetch={onPriceFetch} />
          ))}
      </div>
    </div>
  );
}

export default function DeckGridView({ commanderCard, planeswalkerCards, mainboardCards, sideboardCards, onCardHover, onCardLeave, onPriceFetch }: DeckGridViewProps) {
  const mainboardGrouped = useMemo(() => mainboardCards.reduce((acc, card) => { const mainType = card.type_line.includes("Creature") ? "Criaturas" : card.type_line.includes("Land") ? "Terrenos" : card.type_line.includes("Instant") ? "Mágicas Instantâneas" : card.type_line.includes("Sorcery") ? "Feitiços" : card.type_line.includes("Artifact") ? "Artefatos" : card.type_line.includes("Enchantment") ? "Encantamentos" : "Outros"; if (!acc[mainType]) acc[mainType] = []; acc[mainType].push(card); return acc; }, {} as Record<string, GridCardData[]>), [mainboardCards]);
  const sideboardGrouped = useMemo(() => sideboardCards.reduce((acc, card) => { const mainType = card.type_line.includes("Creature") ? "Criaturas" : card.type_line.includes("Land") ? "Terrenos" : card.type_line.includes("Instant") ? "Mágicas Instantâneas" : card.type_line.includes("Sorcery") ? "Feitiços" : card.type_line.includes("Artifact") ? "Artefatos" : card.type_line.includes("Enchantment") ? "Encantamentos" : "Outros"; if (!acc[mainType]) acc[mainType] = []; acc[mainType].push(card); return acc; }, {} as Record<string, GridCardData[]>), [sideboardCards]);
  const typeOrder = ["Criaturas", "Mágicas Instantâneas", "Feitiços", "Encantamentos", "Artefatos", "Terrenos", "Outros"];

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row gap-8 items-start">
          {commanderCard && ( <div className="flex-shrink-0"> <h3 className="text-xl font-bold text-amber-500 mb-4 flex items-center gap-2"><Crown /> Comandante</h3> <div className="w-[150px]"> <GridCardDisplay card={commanderCard} onCardHover={onCardHover} onCardLeave={onCardLeave} onPriceFetch={onPriceFetch} /> </div> </div> )}
          {planeswalkerCards.length > 0 && ( <div className="flex-1"> <h3 className="text-xl font-bold text-amber-500 mb-4 flex items-center gap-2"> <Star /> Planeswalkers ({planeswalkerCards.reduce((sum, card) => sum + card.count, 0)}) </h3> <div className="flex flex-wrap gap-4"> {planeswalkerCards.sort((a,b) => a.name.localeCompare(b.name)).map(card => ( <div key={card.id} className="w-[120px]"> <GridCardDisplay card={card} onCardHover={onCardHover} onCardLeave={onCardLeave} onPriceFetch={onPriceFetch} /> </div> ))} </div> </div> )}
      </div>
      {(commanderCard || planeswalkerCards.length > 0) && <div className="border-b border-neutral-700"></div>}
      <h2 className="text-2xl font-bold text-amber-500 mt-8">Deck Principal</h2>
      {typeOrder.map(type => { const cardsOfType = mainboardGrouped[type]; if (!cardsOfType || cardsOfType.length === 0) return null; return <CardGridSection key={type} title={type} cards={cardsOfType} onCardHover={onCardHover} onCardLeave={onCardLeave} onPriceFetch={onPriceFetch} /> })}
      {sideboardCards.length > 0 && ( <div className="mt-8"> <h2 className="text-2xl font-bold text-amber-500">Sideboard</h2> {typeOrder.map(type => { const cardsOfType = sideboardGrouped[type]; if (!cardsOfType || cardsOfType.length === 0) return null; return <CardGridSection key={`${type}-sideboard`} title={type} cards={cardsOfType} onCardHover={onCardHover} onCardLeave={onCardLeave} onPriceFetch={onPriceFetch} /> })} </div> )}
    </div>
  );
}