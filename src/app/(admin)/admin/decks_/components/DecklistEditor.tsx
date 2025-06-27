'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus } from "lucide-react";
import ManaCost from "@/components/ui/ManaCost";
import type { ScryfallCard } from "@/app/lib/types";

interface DecklistCard {
  count: number;
  card: ScryfallCard;
}

interface DecklistEditorProps {
  title: string;
  cards: DecklistCard[];
  onQuantityChange: (cardName: string, newCount: number) => void;
  onRemoveCard: (cardName: string) => void;
}

export default function DecklistEditor({ title, cards, onQuantityChange, onRemoveCard }: DecklistEditorProps) {
  const totalCount = cards.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="bg-neutral-900 border-neutral-800 h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title} ({totalCount})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[500px] overflow-y-auto pr-3">
        {cards.map(({ card, count }) => (
          <div key={card.id} className="flex items-center justify-between p-2 rounded-md hover:bg-neutral-800/50">
            <div className="flex items-center gap-2 truncate">
              <span className="text-neutral-200 truncate">{card.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <ManaCost cost={card.mana_cost || ''} />
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onQuantityChange(card.name, count - 1)}><Minus size={14} /></Button>
              <span className="font-bold w-4 text-center">{count}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onQuantityChange(card.name, count + 1)}><Plus size={14} /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-400" onClick={() => onRemoveCard(card.name)}><X size={14} /></Button>
            </div>
          </div>
        ))}
        {cards.length === 0 && <p className="text-center text-neutral-500 py-4">Adicione cartas ao {title.toLowerCase()}.</p>}
      </CardContent>
    </Card>
  );
}