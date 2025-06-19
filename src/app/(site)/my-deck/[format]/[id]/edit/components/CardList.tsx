/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// app/my-deck/[format]/[id]/edit/components/CardList.tsx
'use client';

import { useMemo, useState } from 'react';
import type { EditableCard } from '../DeckEditView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ManaCost from '@/components/ui/ManaCost';
import { Minus, Plus, Library } from 'lucide-react';

// AJUSTE 1: Importar a função fetchCardById e a action da coleção
import { upsertCardInCollection } from '@/app/actions/collectionActions';
import { fetchCardById } from '@/app/lib/scryfall';
import { toast } from 'sonner';

interface CardRowProps {
  card: EditableCard;
  collection: Map<string, number>;
  onCountChange: (name: string, newCount: number) => void;
  onCollectionChange: (cardId: string, newQuantity: number) => void;
  onCardHover: (event: React.MouseEvent, imageUrl: string | null) => void;
  onCardLeave: () => void;
}

function CardRow({ card, collection, onCountChange, onCollectionChange, onCardHover, onCardLeave }: CardRowProps) {
  const [isUpdatingCollection, setIsUpdatingCollection] = useState(false);
  const ownedCount = collection.get(card.id) || 0;
  const neededCount = card.count;
  const hasEnough = ownedCount >= neededCount;

  // AJUSTE 2: A função agora busca os dados completos da carta antes de salvar
  const handleCollectionUpdate = async (newQuantity: number) => {
    setIsUpdatingCollection(true);

    // 1. Busca os dados completos da carta pelo ID para garantir que temos tudo
    const fullCardData = await fetchCardById(card.id);

    if (!fullCardData) {
      toast.error("Não foi possível obter os detalhes completos da carta. Tente novamente.");
      setIsUpdatingCollection(false);
      return;
    }

    // 2. Prepara o objeto com os dados completos para a server action
    const collectionCardData = {
        card_scryfall_id: fullCardData.id,
        card_name: fullCardData.name,
        quantity: newQuantity,
        set_code: fullCardData.set, // Agora temos certeza que este valor existe
        set_name: fullCardData.set_name,
        collector_number: fullCardData.collector_number,
        image_url: fullCardData.image_uris?.normal,
        is_foil: false,
    };

    // 3. Chama a action para salvar no banco de dados
    const result = await upsertCardInCollection(collectionCardData);

    if (!('error' in result)) {
      onCollectionChange(card.id, newQuantity);
      toast.success(`Coleção de "${card.name}" atualizada!`);
    } else {
      toast.error(result.error || "Falha ao atualizar a coleção.");
    }
    setIsUpdatingCollection(false);
  };

  return (
    <div 
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-2 px-2 rounded-md hover:bg-neutral-800/50"
      onMouseEnter={(e) => onCardHover(e, card.image_uris?.normal || null)}
      onMouseLeave={onCardLeave}
    >
      <div className="flex flex-col flex-grow w-full sm:w-auto">
        <div className="flex items-center justify-between w-full">
            <span className="flex-grow truncate pr-4">{card.name}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
                <ManaCost cost={card.mana_cost || ''} />
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => onCountChange(card.name, neededCount - 1)}><Minus size={16} /></Button>
                <span className="w-4 text-center font-medium">{neededCount}</span>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => onCountChange(card.name, neededCount + 1)}><Plus size={16} /></Button>
            </div>
        </div>
      </div>

      <div className={`flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0 sm:ml-4 p-1 rounded-md transition-colors ${hasEnough ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
        <Library size={14} className={hasEnough ? 'text-green-400' : 'text-yellow-400'}/>
        <span className={`text-xs font-medium ${hasEnough ? 'text-green-400' : 'text-yellow-400'}`}>
          Possui:
        </span>
        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCollectionUpdate(ownedCount - 1)} disabled={isUpdatingCollection || ownedCount <= 0}><Minus size={16} /></Button>
        <span className="w-4 text-center font-medium text-sm">{ownedCount}</span>
        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCollectionUpdate(ownedCount + 1)} disabled={isUpdatingCollection}><Plus size={16} /></Button>
      </div>
    </div>
  );
}

// O restante do arquivo (CardSection, CardList) permanece o mesmo,
// pois eles apenas repassam as props.
// ... (código dos componentes CardSection e CardList sem alterações) ...
interface CardListProps {
  cards: EditableCard[];
  commanderName?: string;
  collection: Map<string, number>;
  onCountChange: (name: string, newCount: number) => void;
  onCollectionChange: (cardId: string, newQuantity: number) => void;
  onCardHover: (event: React.MouseEvent, imageUrl: string | null) => void;
  onCardLeave: () => void;
};

const TYPE_ORDER = ["Planeswalkers", "Criaturas", "Mágicas Instantâneas", "Feitiços", "Encantamentos", "Artefatos", "Terrenos", "Outros"];

function CardSection({ cardList, collection, onCountChange, onCollectionChange, onCardHover, onCardLeave }: { 
  cardList: EditableCard[]; 
  collection: Map<string, number>;
  onCountChange: (name: string, newCount: number) => void;
  onCollectionChange: (cardId: string, newQuantity: number) => void;
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
          <CardRow key={card.id} card={card} collection={collection} onCountChange={onCountChange} onCollectionChange={onCollectionChange} onCardHover={onCardHover} onCardLeave={onCardLeave} />
        ))}
      </div>
    );
  });
}

export default function CardList({ cards, commanderName, collection, onCountChange, onCollectionChange, onCardHover, onCardLeave }: CardListProps) {
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
        <CardSection cardList={mainboardCards} collection={collection} onCountChange={onCountChange} onCollectionChange={onCollectionChange} onCardHover={onCardHover} onCardLeave={onCardLeave} />

        {sideboardCards.length > 0 && (
          <div className="mt-6 pt-4 border-t border-neutral-700">
            <h3 className="text-xl font-bold text-amber-500 mb-2">Sideboard ({sideboardCount})</h3>
            <CardSection cardList={sideboardCards} collection={collection} onCountChange={onCountChange} onCollectionChange={onCollectionChange} onCardHover={onCardHover} onCardLeave={onCardLeave} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}