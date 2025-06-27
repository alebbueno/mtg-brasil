/* eslint-disable no-unused-vars */
'use client'

import ManaCost from "@/components/ui/ManaCost";
import type { ScryfallCard } from "@/app/lib/types";

interface DecklistRowProps {
  count: number;
  card: ScryfallCard;
  onHover: (card: ScryfallCard | null) => void;
}

export default function DecklistRow({ count, card, onHover }: DecklistRowProps) {
  return (
    <li 
      className="flex justify-between items-center text-sm p-1.5 rounded-md hover:bg-neutral-800/70"
      onMouseEnter={() => onHover(card)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-2 truncate">
        <span className="text-neutral-400 w-6">{count}x</span>
        <span className="text-neutral-200 truncate">{card.name}</span>
      </div>
      {card.mana_cost && <ManaCost cost={card.mana_cost} />}
    </li>
  );
}