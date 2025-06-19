/* eslint-disable no-unused-vars */
'use client';

import { useState, useCallback } from 'react';
import type { ScryfallCard } from '@/app/(site)/lib/scryfall';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

type DeckCard = {
  name: string;
  count: number;
};

type DeckListViewEditProps = {
  commanderCard: { card: ScryfallCard; count: number } | null;
  mainboardGrouped: Record<string, { card: ScryfallCard; count: number }[]>;
  mainboardTotalCount: number;
  sideboardGrouped: Record<string, { card: ScryfallCard; count: number }[]>;
  sideboardTotalCount: number;
  onCardHover: (url: string | null) => void;
  onCardLeave: () => void;
  onDeckChange: (newMainboard: DeckCard[], newSideboard: DeckCard[]) => void;
};

function CardListSection({
  title,
  cards,
  totalCount,
  onCardHover,
  onCardLeave,
  onAddCard,
  onRemoveCard,
}: {
  title: string;
  cards: { card: ScryfallCard; count: number }[];
  totalCount: number;
  onCardHover: (url: string | null) => void;
  onCardLeave: () => void;
  onAddCard: (cardName: string) => void;
  onRemoveCard: (cardName: string) => void;
}) {
  if (cards.length === 0) return null;

  return (
    <Card className="bg-neutral-900 border-neutral-800 mb-4">
      <CardHeader>
        <CardTitle className="text-amber-500">
          {title} ({totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {cards.map((cardInfo, index) => (
            <li
              key={`${cardInfo.card.id}-${index}`}
              className="py-1 flex items-center justify-between"
              onMouseEnter={() =>
                onCardHover(cardInfo.card.image_uris?.normal || null)
              }
              onMouseLeave={onCardLeave}
            >
              <span>
                {cardInfo.count} x {cardInfo.card.name}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveCard(cardInfo.card.name)}
                  disabled={cardInfo.count <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddCard(cardInfo.card.name)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function DeckListViewEdit({
  commanderCard,
  mainboardGrouped,
  sideboardGrouped,
  onCardHover,
  onCardLeave,
  onDeckChange,
}: DeckListViewEditProps) {
  // Estado local para gerenciar mainboard e sideboard
  const [mainboard, setMainboard] = useState<DeckCard[]>(
    Object.values(mainboardGrouped)
      .flat()
      .map(({ card, count }) => ({ name: card.name, count }))
  );
  const [sideboard, setSideboard] = useState<DeckCard[]>(
    Object.values(sideboardGrouped)
      .flat()
      .map(({ card, count }) => ({ name: card.name, count }))
  );

  // Função para adicionar uma cópia de uma carta
  const handleAddCard = useCallback(
    (cardName: string, isSideboard: boolean = false) => {
      const updateDeck = (deck: DeckCard[]) => {
        const newDeck = [...deck];
        const cardIndex = newDeck.findIndex((c) => c.name === cardName);
        if (cardIndex >= 0) {
          newDeck[cardIndex] = { ...newDeck[cardIndex], count: newDeck[cardIndex].count + 1 };
        } else {
          newDeck.push({ name: cardName, count: 1 });
        }
        return newDeck;
      };

      if (isSideboard) {
        const newSideboard = updateDeck(sideboard);
        setSideboard(newSideboard);
        onDeckChange(mainboard, newSideboard);
      } else {
        const newMainboard = updateDeck(mainboard);
        setMainboard(newMainboard);
        onDeckChange(newMainboard, sideboard);
      }
    },
    [mainboard, sideboard, onDeckChange]
  );

  // Função para remover uma cópia de uma carta
  const handleRemoveCard = useCallback(
    (cardName: string, isSideboard: boolean = false) => {
      const updateDeck = (deck: DeckCard[]) => {
        const newDeck = [...deck];
        const cardIndex = newDeck.findIndex((c) => c.name === cardName);
        if (cardIndex >= 0) {
          if (newDeck[cardIndex].count > 1) {
            newDeck[cardIndex] = { ...newDeck[cardIndex], count: newDeck[cardIndex].count - 1 };
          } else {
            newDeck.splice(cardIndex, 1);
          }
        }
        return newDeck;
      };

      if (isSideboard) {
        const newSideboard = updateDeck(sideboard);
        setSideboard(newSideboard);
        onDeckChange(mainboard, newSideboard);
      } else {
        const newMainboard = updateDeck(mainboard);
        setMainboard(newMainboard);
        onDeckChange(newMainboard, sideboard);
      }
    },
    [mainboard, sideboard, onDeckChange]
  );

  // Função para reagrupar as cartas para exibição
  const groupForListView = (deckCards: DeckCard[], scryfallMap: Map<string, ScryfallCard>) => {
    const grouped: Record<string, { card: ScryfallCard; count: number }[]> = {};

    for (const deckCard of deckCards) {
      const cardData = scryfallMap.get(deckCard.name);
      if (!cardData) continue;

      let mainType = 'Outros';
      if (cardData.type_line.includes('Planeswalker')) mainType = 'Planeswalkers';
      else if (cardData.type_line.includes('Creature')) mainType = 'Criaturas';
      else if (cardData.type_line.includes('Instant')) mainType = 'Mágicas Instantâneas';
      else if (cardData.type_line.includes('Sorcery')) mainType = 'Feitiços';
      else if (cardData.type_line.includes('Artifact')) mainType = 'Artefatos';
      else if (cardData.type_line.includes('Enchantment')) mainType = 'Encantamentos';
      else if (cardData.type_line.includes('Land')) mainType = 'Terrenos';

      grouped[mainType] ||= [];
      grouped[mainType].push({ card: cardData, count: deckCard.count });
    }

    const order = [
      'Planeswalkers',
      'Criaturas',
      'Mágicas Instantâneas',
      'Feitiços',
      'Encantamentos',
      'Artefatos',
      'Terrenos',
      'Outros',
    ];
    return Object.fromEntries(order.map((type) => [type, grouped[type] || []]));
  };

  // Reagrupar mainboard e sideboard para exibição
  const updatedMainboardGrouped = groupForListView(mainboard, new Map(Object.entries(mainboardGrouped).flatMap(([, cards]) => cards.map(c => [c.card.name, c.card]))));
  const updatedSideboardGrouped = groupForListView(sideboard, new Map(Object.entries(sideboardGrouped).flatMap(([, cards]) => cards.map(c => [c.card.name, c.card]))));

  return (
    <div>
      {commanderCard && (
        <Card className="bg-neutral-900 border-neutral-800 mb-4">
          <CardHeader>
            <CardTitle className="text-amber-500">Comandante</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onMouseEnter={() =>
                onCardHover(commanderCard.card.image_uris?.normal || null)
              }
              onMouseLeave={onCardLeave}
            >
              {commanderCard.count} x {commanderCard.card.name}
            </div>
          </CardContent>
        </Card>
      )}
      {Object.entries(updatedMainboardGrouped).map(([type, cards]) => (
        <CardListSection
          key={type}
          title={type}
          cards={cards}
          totalCount={cards.reduce((sum, c) => sum + c.count, 0)}
          onCardHover={onCardHover}
          onCardLeave={onCardLeave}
          onAddCard={(cardName) => handleAddCard(cardName, false)}
          onRemoveCard={(cardName) => handleRemoveCard(cardName, false)}
        />
      ))}
      {sideboard.length > 0 && (
        <>
          <h3 className="text-xl font-bold text-amber-500 mb-4">Sideboard</h3>
          {Object.entries(updatedSideboardGrouped).map(([type, cards]) => (
            <CardListSection
              key={`sideboard-${type}`}
              title={type}
              cards={cards}
              totalCount={cards.reduce((sum, c) => sum + c.count, 0)}
              onCardHover={onCardHover}
              onCardLeave={onCardLeave}
              onAddCard={(cardName) => handleAddCard(cardName, true)}
              onRemoveCard={(cardName) => handleRemoveCard(cardName, true)}
            />
          ))}
        </>
      )}
    </div>
  );
}