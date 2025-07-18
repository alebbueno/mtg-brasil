/* eslint-disable no-unused-vars */
'use client'

import type { ScryfallCard } from '@/app/lib/types'; 
import ManaCost from '@/components/ui/ManaCost';
import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; 

function CardListSection({ title, cards, totalCount, onCardHover, onCardLeave, onPriceFetch, showPhysicalCards, userPhysicalCollection }: { 
    title: string; 
    cards: Record<string, { card: ScryfallCard; count: number }[]>; 
    totalCount: number;
    onCardHover: (imageUrl: string) => void;
    onCardLeave: () => void;
    onPriceFetch: (card: ScryfallCard | null) => void;
    showPhysicalCards: boolean; 
    userPhysicalCollection: Map<string, number>; 
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
              {cardList.sort((a,b) => a.card.name.localeCompare(b.card.name)).map(({ card, count }) => {
                const ownedCount = userPhysicalCollection.get(card.id) || 0; 
                const hasEnoughCopies = ownedCount >= count;
                const hasSomeCopies = ownedCount > 0;

                return (
                  // CORREÇÃO: A KEY JÁ ESTÁ CORRETA AQUI (card.id), o erro pode vir de outro lugar
                  // mas a inspeção do erro aponta para essa linha. Vamos verificar se `card.id`
                  // realmente está sendo preenchido corretamente em todos os casos.
                  <li 
                    key={card.id} // ✅ Key correta aqui
                    className={`
                      text-neutral-200 p-1 rounded-md cursor-pointer flex justify-between items-center text-sm relative
                      ${showPhysicalCards && !hasSomeCopies ? 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100' : 'hover:bg-neutral-800'}
                    `}
                    onMouseEnter={() => {
                      onCardHover(card.image_uris?.normal || '');
                      onPriceFetch(card);
                    }}
                    onMouseLeave={() => {
                      onCardLeave();
                      onPriceFetch(null);
                    }}
                  >
                    <span className="flex-grow truncate">{count}x {card.name}</span>
                    {showPhysicalCards && (
                      <Badge 
                        variant={hasEnoughCopies ? 'default' : 'destructive'} 
                        className="ml-2 px-2 py-0.5 text-xs rounded-full"
                        title={hasEnoughCopies ? 'Você tem cópias suficientes' : 'Faltam cópias'}
                      >
                        {ownedCount}/{count}
                      </Badge>
                    )}
                    <ManaCost cost={card.mana_cost} className="ml-2 flex-shrink-0" />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DeckListViewProps {
    commanderCard: { card: ScryfallCard; count: number } | null;
    mainboardGrouped: Record<string, { card: ScryfallCard; count: number }[]>;
    mainboardTotalCount: number;
    sideboardGrouped: Record<string, { card: ScryfallCard; count: number }[]>;
    sideboardTotalCount: number;
    onCardHover: (url: string) => void;
    onCardLeave: () => void;
    onPriceFetch: (card: ScryfallCard | null) => void;
    showPhysicalCards: boolean; 
    userPhysicalCollection: Map<string, number>; 
}

export default function DeckListView({ commanderCard, mainboardGrouped, mainboardTotalCount, sideboardGrouped, sideboardTotalCount, onCardHover, onCardLeave, onPriceFetch, showPhysicalCards, userPhysicalCollection }: DeckListViewProps) {
  return (
    <div className="space-y-12">
      {commanderCard && (
        <div>
          <h2 className="text-2xl font-bold text-amber-500 mb-4 flex items-center gap-2"><Crown /> Comandante</h2>
          <ul className="space-y-1">
            {(() => { 
                const ownedCount = userPhysicalCollection.get(commanderCard.card.id) || 0;
                const hasEnoughCopies = ownedCount >= commanderCard.count;
                const hasSomeCopies = ownedCount > 0;
                return (
                    // CORREÇÃO: A KEY JÁ ESTÁ CORRETA AQUI (commanderCard.card.id)
                    <li 
                      key={commanderCard.card.id} // ✅ Key correta aqui
                      className={`
                        text-neutral-200 p-1 rounded-md cursor-pointer flex justify-between items-center text-sm relative
                        ${showPhysicalCards && !hasSomeCopies ? 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100' : 'hover:bg-neutral-800'}
                      `}
                      onMouseEnter={() => {
                        onCardHover(commanderCard.card.image_uris?.normal || '');
                        onPriceFetch(commanderCard.card);
                      }}
                      onMouseLeave={() => {
                        onCardLeave();
                        onPriceFetch(null);
                      }}
                    >
                      <span className="flex-grow truncate">{commanderCard.count}x {commanderCard.card.name}</span>
                      {showPhysicalCards && (
                        <Badge 
                          variant={hasEnoughCopies ? 'default' : 'destructive'} 
                          className="ml-2 px-2 py-0.5 text-xs rounded-full"
                          title={hasEnoughCopies ? 'Você tem cópias suficientes' : 'Faltam cópias'}
                        >
                          {ownedCount}/{commanderCard.count}
                        </Badge>
                      )}
                      <ManaCost cost={commanderCard.card.mana_cost} className="ml-2 flex-shrink-0" />
                    </li>
                );
            })()}
          </ul>
        </div>
      )}
      <CardListSection 
        title="Mainboard" 
        cards={mainboardGrouped} 
        totalCount={mainboardTotalCount} 
        onCardHover={onCardHover} 
        onCardLeave={onCardLeave} 
        onPriceFetch={onPriceFetch} 
        showPhysicalCards={showPhysicalCards} 
        userPhysicalCollection={userPhysicalCollection} 
      />
      <CardListSection 
        title="Sideboard" 
        cards={sideboardGrouped} 
        totalCount={sideboardTotalCount} 
        onCardHover={onCardHover} 
        onCardLeave={onCardLeave} 
        onPriceFetch={onPriceFetch} 
        showPhysicalCards={showPhysicalCards} 
        userPhysicalCollection={userPhysicalCollection} 
      />
    </div>
  )
}