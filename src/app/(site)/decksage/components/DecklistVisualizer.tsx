/* eslint-disable react/prop-types */
'use client'

import { useState, useMemo, useEffect } from "react";
import type { ScryfallCard } from "@/app/lib/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, LayoutGrid } from "lucide-react";
import Image from "next/image";
import ManaCost from "@/components/ui/ManaCost";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Decklist {
  commander?: { count: number, name: string }[];
  mainboard: { count: number, name: string }[];
  sideboard?: { count: number, name: string }[];
}

interface DecklistVisualizerProps {
  decklist: Decklist | null;
  cardDataMap: Map<string, ScryfallCard>;
}

// AJUSTE: Dividimos a ordem de renderização em duas fileiras
const TOP_ROW_ORDER = ['Commander', 'Planeswalker'];
const MAIN_ROW_ORDER = ['Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Battle', 'Land', 'Other'];

const TYPE_DISPLAY_NAMES: Record<string, string> = {
    'Commander': 'Comandante', 'Creature': 'Criaturas', 'Planeswalker': 'Planeswalkers', 
    'Instant': 'Mágicas Instantâneas', 'Sorcery': 'Feitiços', 'Artifact': 'Artefatos', 
    'Enchantment': 'Encantamentos', 'Battle': 'Batalhas', 'Land': 'Terrenos', 'Other': 'Outros'
};

export default function DecklistVisualizer({ decklist, cardDataMap }: DecklistVisualizerProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);

  const allCardsWithData = useMemo(() => {
    if (!decklist) return [];
    return [
      ...(decklist.commander?.map(c => ({ ...c, groupType: 'Commander' })) || []),
      ...decklist.mainboard.map(c => ({ ...c, groupType: 'Mainboard' })),
    ]
    .map(item => ({ ...item, card: cardDataMap.get(item.name) }))
    .filter(item => item.card) as { count: number, name: string, groupType: string, card: ScryfallCard }[];
  }, [decklist, cardDataMap]);

  const groupedCards = useMemo(() => {
    const groups: Record<string, { card: ScryfallCard, count: number }[]> = {};
    allCardsWithData.forEach(item => {
      let mainType = 'Other';
      if (item.groupType === 'Commander') mainType = 'Commander';
      else if (item.card.type_line.includes("Creature")) mainType = "Creature";
      else if (item.card.type_line.includes("Planeswalker")) mainType = "Planeswalker";
      else if (item.card.type_line.includes("Battle")) mainType = "Battle";
      else if (item.card.type_line.includes("Instant")) mainType = "Instant";
      else if (item.card.type_line.includes("Sorcery")) mainType = "Sorcery";
      else if (item.card.type_line.includes("Artifact")) mainType = "Artifact";
      else if (item.card.type_line.includes("Enchantment")) mainType = "Enchantment";
      else if (item.card.type_line.includes("Land")) mainType = "Land";

      if (!groups[mainType]) groups[mainType] = [];
      groups[mainType].push({ card: item.card, count: item.count });
    });

    Object.values(groups).forEach(group => group.sort((a,b) => a.card.cmc - b.card.cmc || a.card.name.localeCompare(b.card.name)));
    return groups;
  }, [allCardsWithData]);

  useEffect(() => {
    if (allCardsWithData.length > 0 && !selectedCard) {
      setSelectedCard(allCardsWithData[0].card);
    }
  }, [allCardsWithData, selectedCard]);

  if (!decklist) return <p className="text-sm text-neutral-400">Decklist não disponível.</p>;

  // Componente para a linha de carta, para evitar repetição de código
  const CardRow = ({ card, count }: { card: ScryfallCard, count: number }) => (
    <li key={card.id} className="flex justify-between items-center text-sm p-1.5 rounded-md cursor-pointer hover:bg-neutral-800 transition-colors" onMouseEnter={() => setSelectedCard(card)}>
      <p className="text-neutral-200 truncate">{count}x {card.name}</p>
      <ManaCost cost={card.mana_cost || ''} />
    </li>
  );

  return (
    <Card className="bg-neutral-900 border-neutral-800 flex flex-col lg:flex-row">
      {/* Coluna da Imagem da Carta (Lateral) */}
      <div className="w-full lg:w-1/3 p-4 flex justify-center items-start lg:sticky lg:top-24 self-start border-b lg:border-b-0 lg:border-r border-neutral-800">
        {selectedCard ? (
          <Image src={selectedCard.image_uris?.large || ''} alt={selectedCard.name} unoptimized width={488} height={680} className="rounded-xl shadow-lg shadow-black/30" priority />
        ) : (
          <div className="aspect-[5/7] w-full max-w-[300px] bg-neutral-950 rounded-xl flex items-center justify-center text-neutral-500"><p>Passe o mouse sobre uma carta</p></div>
        )}
      </div>

      {/* Coluna da Lista/Grid */}
      <div className="w-full lg:w-2/3 p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl">Lista de Cartas</h3>
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => { if (value) setViewMode(value as any)}}>
            <ToggleGroupItem value="list" aria-label="Visualizar em lista"><List className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Visualizar em grade"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="overflow-y-auto max-h-[70vh] pr-2">
            {viewMode === 'list' ? (
                <div className="space-y-6">
                    {/* Fileira Superior: Comandante e Planeswalkers */}
                    <div className="space-y-4">
                        {TOP_ROW_ORDER.map(type => {
                            const items = groupedCards[type];
                            if (!items || items.length === 0) return null;
                            const count = items.reduce((sum, item) => sum + item.count, 0);
                            return (<div key={type}><h4 className="font-semibold text-amber-400 mb-2">{TYPE_DISPLAY_NAMES[type]} ({count})</h4><ul className="space-y-0.5">{items.map(item => <CardRow key={item.card.id} {...item} />)}</ul></div>)
                        })}
                    </div>
                    {/* Separador */}
                    <Separator className="bg-neutral-700/50" />
                    {/* Fileira Principal: Outras permanentes */}
                    <div className="grid md:grid-cols-2 gap-x-6">
                        {MAIN_ROW_ORDER.map(type => {
                            const items = groupedCards[type];
                            if (!items || items.length === 0) return null;
                            const count = items.reduce((sum, item) => sum + item.count, 0);
                            return (<div key={type} className="mb-6 break-inside-avoid"><h4 className="font-semibold text-amber-400 mb-2">{TYPE_DISPLAY_NAMES[type]} ({count})</h4><ul className="space-y-0.5">{items.map(item => <CardRow key={item.card.id} {...item} />)}</ul></div>)
                        })}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Fileira Superior: Comandante e Planeswalkers */}
                    <div>
                        {TOP_ROW_ORDER.map(type => {
                             const items = groupedCards[type];
                             if (!items || items.length === 0) return null;
                             return (<div key={type} className="mb-6"><h4 className="font-semibold text-amber-400 mb-2">{TYPE_DISPLAY_NAMES[type]} ({items.reduce((s,i)=>s+i.count,0)})</h4><div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">{items.map(({card, count})=>(<div key={card.id} className="relative cursor-pointer" onMouseEnter={() => setSelectedCard(card)}><Image src={card.image_uris?.normal || ''} alt={card.name} width={244} unoptimized height={340} className="rounded-md shadow-sm transition-transform hover:scale-105" /><div className="absolute top-1 right-1 bg-black/80 ...">{count}</div></div>))}</div></div>)
                        })}
                    </div>
                     {/* Separador */}
                    <Separator className="bg-neutral-700/50" />
                    {/* Fileira Principal: Outras permanentes */}
                     <div>
                        {MAIN_ROW_ORDER.map(type => {
                             const items = groupedCards[type];
                             if (!items || items.length === 0) return null;
                             return (<div key={type} className="mb-6"><h4 className="font-semibold text-amber-400 mb-2">{TYPE_DISPLAY_NAMES[type]} ({items.reduce((s,i)=>s+i.count,0)})</h4><div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">{items.map(({card, count})=>(<div key={card.id} className="relative cursor-pointer" onMouseEnter={() => setSelectedCard(card)}><Image src={card.image_uris?.normal || ''} alt={card.name} width={244} height={340} unoptimized className="rounded-md shadow-sm transition-transform hover:scale-105" /><div className="absolute top-1 right-1 bg-black/80 ...">{count}</div></div>))}</div></div>)
                        })}
                    </div>
                </div>
            )}
        </div>
      </div>
    </Card>
  );
}