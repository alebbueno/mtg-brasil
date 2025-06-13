/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// app/my-deck/[format]/[id]/edit/components/CardList.tsx
'use client';

import { useMemo } from 'react';
import type { EditableCard } from '../DeckEditView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ManaCost from '@/components/ui/ManaCost';
import { Minus, Plus } from 'lucide-react';
// import type { ScryfallCard } from '@/app/lib/types';

// O componente CardRow agora recebe a assinatura correta para onCardHover
function CardRow({ card, onCountChange, onCardHover, onCardLeave }: { 
  card: EditableCard; 
  onCountChange: (name: string, newCount: number) => void;
  onCardHover: (event: React.MouseEvent, imageUrl: string | null) => void;
  onCardLeave: () => void;
}) {
  return (
    <div 
      className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-neutral-800 text-sm"
      // ✨ CORREÇÃO: Passa o evento (e) para o manipulador de hover
      onMouseEnter={(e) => onCardHover(e, card.image_uris?.normal || null)}
      onMouseLeave={onCardLeave}
    >
      <span className="flex-grow truncate pr-4">{card.name}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <ManaCost cost={card.mana_cost || ''} />
        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => onCountChange(card.name, card.count - 1)}><Minus size={16} /></Button>
        <span className="w-4 text-center font-medium">{card.count}</span>
        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => onCountChange(card.name, card.count + 1)}><Plus size={16} /></Button>
      </div>
    </div>
  );
}

// O tipo das props foi atualizado para corresponder ao componente pai
type CardListProps = {
  cards: EditableCard[];
  commanderName?: string;
  onCountChange: (name: string, newCount: number) => void;
  onCardHover: (event: React.MouseEvent, imageUrl: string | null) => void;
  onCardLeave: () => void;
};

const TYPE_ORDER = ["Planeswalkers", "Criaturas", "Mágicas Instantâneas", "Feitiços", "Encantamentos", "Artefatos", "Terrenos", "Outros"];

function CardSection({ cardList, onCountChange, onCardHover, onCardLeave }: { 
  cardList: EditableCard[]; 
  onCountChange: (name: string, newCount: number) => void;
  onCardHover: (event: React.MouseEvent, imageUrl: string | null) => void;
  onCardLeave: () => void;
}) {
  const groupedCards = useMemo(() => {
    return cardList.reduce((acc, card) => {
      if (!card.type_line) return acc;
      let mainType = "Outros";
      if (card.type_line.includes("Planeswalker")) mainType = "Planeswalkers";
      else if (card.type_line.includes("Creature")) mainType = "Criaturas";
      else if (card.type_line.includes("Land")) mainType = "Terrenos";
      else if (card.type_line.includes("Instant")) mainType = "Mágicas Instantâneas";
      else if (card.type_line.includes("Sorcery")) mainType = "Feitiços";
      else if (card.type_line.includes("Artifact")) mainType = "Artefatos";
      else if (card.type_line.includes("Enchantment")) mainType = "Encantamentos";
      
      if (!acc[mainType]) acc[mainType] = [];
      acc[mainType].push(card);
      return acc;
    }, {} as Record<string, EditableCard[]>);
  }, [cardList]);

  return TYPE_ORDER.map(type => {
    const cardsOfType = groupedCards[type];
    if (!cardsOfType || cardsOfType.length === 0) return null;
    
    const typeCount = cardsOfType.reduce((sum, card) => sum + card.count, 0);

    return (
      <div key={type}>
        <h4 className="font-semibold text-amber-500/80 mt-2">{type} ({typeCount})</h4>
        {cardsOfType.sort((a, b) => a.name.localeCompare(b.name)).map(card => (
          <CardRow key={card.id} card={card} onCountChange={onCountChange} onCardHover={onCardHover} onCardLeave={onCardLeave} />
        ))}
      </div>
    );
  });
}

export default function CardList({ cards, commanderName, onCountChange, onCardHover, onCardLeave }: CardListProps) {
  const { mainboardCards, sideboardCards, mainboardCount, sideboardCount } = useMemo(() => {
    const main = cards.filter(c => !c.is_sideboard && c.name !== commanderName);
    const side = cards.filter(c => c.is_sideboard);
    
    const mainCount = main.reduce((s, c) => s + c.count, 0);
    const sideCount = side.reduce((s, c) => s + c.count, 0);

    return { 
      mainboardCards: main, 
      sideboardCards: side, 
      mainboardCount: mainCount, 
      sideboardCount: sideCount 
    };
  }, [cards, commanderName]);

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader><CardTitle>Lista de Cartas</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-xl font-bold text-amber-500 mb-2">Mainboard ({mainboardCount})</h3>
        <CardSection cardList={mainboardCards} onCountChange={onCountChange} onCardHover={onCardHover} onCardLeave={onCardLeave} />

        {sideboardCards.length > 0 && (
          <div className="mt-6 pt-4 border-t border-neutral-700">
            <h3 className="text-xl font-bold text-amber-500 mb-2">Sideboard ({sideboardCount})</h3>
            <CardSection cardList={sideboardCards} onCountChange={onCountChange} onCardHover={onCardHover} onCardLeave={onCardLeave} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
