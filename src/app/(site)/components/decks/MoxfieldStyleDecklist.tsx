/* eslint-disable no-unused-vars */
'use client'

import { useMemo } from "react";
import type { ScryfallCard } from "@/app/lib/types";
import DecklistRow from "./DecklistRow";

interface Decklist {
  commander?: { count: number, name: string }[];
  mainboard: { count: number, name: string }[];
  sideboard?: { count: number, name: string }[];
}

interface MoxfieldStyleDecklistProps {
  decklist: Decklist;
  cardDataMap: Map<string, ScryfallCard>;
  onHoverCard: (card: ScryfallCard | null) => void;
}

// Ordem em que os grupos serão exibidos
const TYPE_ORDER = [
    'Commander', 'Creature', 'Planeswalker', 'Instant', 'Sorcery', 
    'Artifact', 'Enchantment', 'Battle', 'Land'
];
// Mapeia o tipo técnico para o nome de exibição em Português
const TYPE_DISPLAY_NAMES: Record<string, string> = {
    'Commander': 'Comandante', 'Creature': 'Criaturas', 'Planeswalker': 'Planeswalkers', 
    'Instant': 'Mágicas Instantâneas', 'Sorcery': 'Feitiços', 'Artifact': 'Artefatos', 
    'Enchantment': 'Encantamentos', 'Battle': 'Batalhas', 'Land': 'Terrenos', 'Other': 'Outros'
};


export default function MoxfieldStyleDecklist({ decklist, cardDataMap, onHoverCard }: MoxfieldStyleDecklistProps) {

  // Agrupa todas as cartas do deck por tipo, usando o `useMemo` para eficiência
  const groupedCards = useMemo(() => {
    const allCards = [
      ...(decklist.commander?.map(c => ({...c, type: 'Commander'})) || []),
      ...(decklist.mainboard.map(c => ({...c, type: 'Mainboard'})) || []),
      ...(decklist.sideboard?.map(c => ({...c, type: 'Sideboard'})) || []),
    ];

    const groups: Record<string, { card: ScryfallCard, count: number }[]> = {};

    allCards.forEach(item => {
      const card = cardDataMap.get(item.name);
      if (!card) return;

      let mainType = 'Other';
      if (item.type === 'Commander') mainType = 'Commander';
      else if (card.type_line.includes("Creature")) mainType = "Creature";
      else if (card.type_line.includes("Planeswalker")) mainType = "Planeswalker";
      else if (card.type_line.includes("Instant")) mainType = "Instant";
      else if (card.type_line.includes("Sorcery")) mainType = "Sorcery";
      else if (card.type_line.includes("Artifact")) mainType = "Artifact";
      else if (card.type_line.includes("Enchantment")) mainType = "Enchantment";
      else if (card.type_line.includes("Battle")) mainType = "Battle";
      else if (card.type_line.includes("Land")) mainType = "Land";

      if (!groups[mainType]) groups[mainType] = [];
      groups[mainType].push({ card, count: item.count });
    });

    // Ordena as cartas dentro de cada grupo por nome
    Object.values(groups).forEach(group => group.sort((a,b) => a.card.name.localeCompare(b.card.name)));

    return groups;
  }, [decklist, cardDataMap]);

  return (
    // A mágica do layout de colunas do CSS
    <div className="md:columns-2 lg:columns-3 xl:columns-4 gap-x-6">
      {TYPE_ORDER.map(type => {
        const items = groupedCards[type];
        if (!items || items.length === 0) return null;
        
        const count = items.reduce((sum, item) => sum + item.count, 0);

        return (
          // Evita que um grupo seja quebrado entre duas colunas
          <div key={type} className="mb-6 break-inside-avoid">
            <h3 className="font-bold text-lg mb-2 border-b border-neutral-700 pb-1 text-amber-400">
              {TYPE_DISPLAY_NAMES[type]} ({count})
            </h3>
            <ul className="space-y-0.5">
              {items.map(({ card, count }) => (
                <DecklistRow key={card.id} card={card} count={count} onHover={onHoverCard} />
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  );
}