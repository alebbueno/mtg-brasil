'use client'

import { useState, useMemo } from "react";
import type { ScryfallCard } from "@/app/lib/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, LayoutGrid } from "lucide-react";
// import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import ManaCost from "@/components/ui/ManaCost";
import { Card } from "@/components/ui/card";

interface Decklist {
  commander?: { count: number, name: string }[];
  mainboard: { count: number, name: string }[];
  sideboard?: { count: number, name: string }[];
}

interface DecklistVisualizerProps {
  decklist: Decklist | null;
  cardDataMap: Map<string, ScryfallCard>;
}

const TYPE_ORDER = ['Commander', 'Creature', 'Planeswalker', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Battle', 'Land', 'Other'];
const TYPE_DISPLAY_NAMES: Record<string, string> = {
    'Commander': 'Comandante', 'Creature': 'Criaturas', 'Planeswalker': 'Planeswalkers', 
    'Instant': 'Mágicas Instantâneas', 'Sorcery': 'Feitiços', 'Artifact': 'Artefatos', 
    'Enchantment': 'Encantamentos', 'Battle': 'Batalhas', 'Land': 'Terrenos', 'Other': 'Outros'
};

export default function DecklistVisualizer({ decklist, cardDataMap }: DecklistVisualizerProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const groupedCards = useMemo(() => {
    if (!decklist) return {};
    
    const allCards = [
      ...(decklist.commander?.map(c => ({ ...c, groupType: 'Commander' })) || []),
      ...decklist.mainboard.map(c => ({ ...c, groupType: 'Mainboard' })),
    ];

    const groups: Record<string, { card: ScryfallCard, count: number }[]> = {};
    allCards.forEach(item => {
      const card = cardDataMap.get(item.name);
      if (!card) return;

      let mainType = 'Other';
      if (item.groupType === 'Commander') mainType = 'Commander';
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

    Object.values(groups).forEach(group => group.sort((a,b) => a.card.name.localeCompare(b.card.name)));
    return groups;
  }, [decklist, cardDataMap]);

  if (!decklist) return <p className="text-sm text-neutral-400">Decklist não disponível.</p>;

  return (
    <Card className="bg-neutral-900 border-neutral-800">
        <div className="flex justify-between items-center p-4 border-b border-neutral-800">
            <h3 className="font-bold text-xl">Lista de Cartas</h3>
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => { if (value) setViewMode(value as any)}}>
                <ToggleGroupItem value="list" aria-label="Visualizar em lista"><List className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Visualizar em grade"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
        </div>
        <div className="p-4 md:p-6">
            {viewMode === 'list' ? (
                <div className="md:columns-2 gap-x-8">
                    {TYPE_ORDER.map(type => {
                        const items = groupedCards[type];
                        if (!items || items.length === 0) return null;
                        const count = items.reduce((sum, item) => sum + item.count, 0);
                        return (
                        <div key={type} className="mb-6 break-inside-avoid">
                            <h4 className="font-semibold text-amber-400 mb-2">{TYPE_DISPLAY_NAMES[type]} ({count})</h4>
                            <ul className="space-y-1">
                            {items.map(({ card, count }) => (
                                <li key={card.id} className="flex justify-between items-center text-sm p-1.5 rounded-md">
                                <p className="text-neutral-200 truncate">{count}x {card.name}</p>
                                <ManaCost cost={card.mana_cost || ''} />
                                </li>
                            ))}
                            </ul>
                        </div>
                        )
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {decklist.mainboard.map(item => {
                        const card = cardDataMap.get(item.name);
                        if (!card) return null;
                        return (
                        <div key={card.id} className="relative">
                            <Image src={card.image_uris?.normal || ''} alt={card.name} width={244} height={340} className="rounded-md" />
                            <div className="absolute top-1 right-1 bg-black/80 text-white font-bold text-xs h-6 w-6 flex items-center justify-center rounded-full border-2 border-white">{item.count}</div>
                        </div>
                        )
                    })}
                </div>
            )}
        </div>
    </Card>
  );
}