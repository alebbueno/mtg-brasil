/* eslint-disable no-unused-vars */
'use client'

import type { ScryfallCard } from '@/app/lib/scryfall';
import ManaCost from '@/components/ui/ManaCost';
import { Crown } from 'lucide-react';

// ADIÇÃO: Nova prop `onPriceFetch`
function CardListSection({ title, cards, totalCount, onCardHover, onCardLeave, onPriceFetch }: { 
    title: string; 
    cards: Record<string, { card: ScryfallCard; count: number }[]>; 
    totalCount: number;
    onCardHover: (imageUrl: string) => void;
    onCardLeave: () => void;
    onPriceFetch: (card: ScryfallCard | null) => void;
}) {
  if (totalCount === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-amber-500 mb-4">{title} ({totalCount})</h2>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-x-6">
        {Object.entries(cards).map(([type, cardList]) => (
          cardList.length > 0 &&
          <div key={type} className="break-inside-avoid mb-6">
            <h3 className="text-lg font-semibold text-neutral-300 mb-2">{type} ({cardList.reduce((acc, c) => acc + c.count, 0)})</h3>
            <ul className="space-y-1">
              {cardList.sort((a,b) => a.card.name.localeCompare(b.card.name)).map(({ card, count }) => (
                <li 
                  key={card.id} 
                  className="text-neutral-200 hover:bg-neutral-800 p-1 rounded-md cursor-pointer flex justify-between items-center text-sm"
                  onMouseEnter={() => {
                    onCardHover(card.image_uris?.normal || '');
                    onPriceFetch(card); // ADIÇÃO: Chamada da nova função
                  }}
                  onMouseLeave={() => {
                    onCardLeave();
                    onPriceFetch(null); // ADIÇÃO: Limpa o preço ao sair
                  }}
                >
                  <span className="flex-grow truncate">{count}x {card.name}</span>
                  <ManaCost cost={card.mana_cost} className="ml-2 flex-shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ADIÇÃO: Nova prop `onPriceFetch`
interface DeckListViewProps {
    commanderCard: { card: ScryfallCard; count: number } | null;
    mainboardGrouped: Record<string, { card: ScryfallCard; count: number }[]>;
    mainboardTotalCount: number;
    sideboardGrouped: Record<string, { card: ScryfallCard; count: number }[]>;
    sideboardTotalCount: number;
    onCardHover: (url: string) => void;
    onCardLeave: () => void;
    onPriceFetch: (card: ScryfallCard | null) => void;
}

export default function DeckListView({ commanderCard, mainboardGrouped, mainboardTotalCount, sideboardGrouped, sideboardTotalCount, onCardHover, onCardLeave, onPriceFetch }: DeckListViewProps) {
  return (
    <div className="space-y-12">
      {commanderCard && (
        <div>
          <h2 className="text-2xl font-bold text-amber-500 mb-4 flex items-center gap-2"><Crown /> Comandante</h2>
          <ul className="space-y-1">
            <li 
              className="text-neutral-200 hover:bg-neutral-800 p-1 rounded-md cursor-pointer flex justify-between items-center text-sm"
              onMouseEnter={() => {
                onCardHover(commanderCard.card.image_uris?.normal || '');
                onPriceFetch(commanderCard.card); // ADIÇÃO
              }}
              onMouseLeave={() => {
                onCardLeave();
                onPriceFetch(null); // ADIÇÃO
              }}
            >
              <span className="flex-grow truncate">{commanderCard.count}x {commanderCard.card.name}</span>
              <ManaCost cost={commanderCard.card.mana_cost} className="ml-2 flex-shrink-0" />
            </li>
          </ul>
        </div>
      )}
      <CardListSection title="Mainboard" cards={mainboardGrouped} totalCount={mainboardTotalCount} onCardHover={onCardHover} onCardLeave={onCardLeave} onPriceFetch={onPriceFetch} />
      <CardListSection title="Sideboard" cards={sideboardGrouped} totalCount={sideboardTotalCount} onCardHover={onCardHover} onCardLeave={onCardLeave} onPriceFetch={onPriceFetch} />
    </div>
  )
}