'use client'

import { useState, useEffect, useMemo } from "react";
import type { ScryfallCard } from "@/app/lib/types";
import { fetchCardsByNames } from "@/app/lib/scryfall";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, LayoutGrid } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import ManaCost from "@/components/ui/ManaCost";

interface Decklist {
  mainboard: { count: number, name: string }[];
  sideboard?: { count: number, name: string }[];
}

interface DecklistVisualizerProps {
  decklist: Decklist | null;
}

export default function DecklistVisualizer({ decklist }: DecklistVisualizerProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [cardDataMap, setCardDataMap] = useState<Map<string, ScryfallCard>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!decklist) {
      setIsLoading(false);
      return;
    }

    const fetchCardData = async () => {
      setIsLoading(true);
      const mainboardNames = decklist.mainboard.map(c => c.name);
      const sideboardNames = decklist.sideboard?.map(c => c.name) || [];
      const uniqueNames = [...new Set([...mainboardNames, ...sideboardNames])];

      const cards = await fetchCardsByNames(uniqueNames);
      setCardDataMap(new Map(cards.map(c => [c.name, c])));
      setIsLoading(false);
    };

    fetchCardData();
  }, [decklist]);

  const groupedMainboard = useMemo(() => {
    if (!decklist || cardDataMap.size === 0) return {};
    
    const groups: Record<string, { card: ScryfallCard, count: number }[]> = {};
    decklist.mainboard.forEach(item => {
      const card = cardDataMap.get(item.name);
      if (!card) return;

      let mainType = "Outros";
      if (card.type_line.includes("Creature")) mainType = "Criaturas";
      else if (card.type_line.includes("Land")) mainType = "Terrenos";
      else if (card.type_line.includes("Planeswalker")) mainType = "Planeswalkers";
      else if (card.type_line.includes("Artifact")) mainType = "Artefatos";
      else if (card.type_line.includes("Enchantment")) mainType = "Encantamentos";
      else if (card.type_line.includes("Instant")) mainType = "Mágicas Instantâneas";
      else if (card.type_line.includes("Sorcery")) mainType = "Feitiços";

      if (!groups[mainType]) groups[mainType] = [];
      groups[mainType].push({ card, count: item.count });
    });

    Object.values(groups).forEach(group => group.sort((a,b) => a.card.name.localeCompare(b.card.name)));

    return groups;
  }, [decklist, cardDataMap]);
  
  const TYPE_ORDER = ['Criaturas', 'Planeswalkers', 'Mágicas Instantâneas', 'Feitiços', 'Artefatos', 'Encantamentos', 'Terrenos', 'Outros'];

  if (!decklist) return <p className="text-sm text-neutral-400">Decklist não disponível.</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => { if (value) setViewMode(value as any)}}>
          <ToggleGroupItem value="list" aria-label="Visualizar em lista"><List className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Visualizar em grade"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {isLoading ? (
        <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-1/2" /></div>
      ) : viewMode === 'list' ? (
        <div className="text-sm space-y-4">
          {TYPE_ORDER.map(type => {
            const items = groupedMainboard[type];
            if (!items || items.length === 0) return null;
            const count = items.reduce((sum, item) => sum + item.count, 0);

            return (
              <div key={type}>
                <h4 className="font-semibold text-amber-400 mb-2">{type} ({count})</h4>
                <ul className="space-y-1">
                  {items.map(({ card, count }) => (
                    <li key={card.id} className="flex justify-between items-center">
                      <span className="text-neutral-200">{count}x {card.name}</span>
                      <ManaCost cost={card.mana_cost || ''} />
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {decklist.mainboard.map(item => {
            const card = cardDataMap.get(item.name);
            if (!card) return null;
            return (
              <div key={card.id} className="relative">
                <Image src={card.image_uris?.normal || ''} unoptimized alt={card.name} width={244} height={340} className="rounded-md" />
                <div className="absolute top-1 right-1 bg-black/80 text-white font-bold text-sm h-6 w-6 flex items-center justify-center rounded-full border-2 border-white">
                  {item.count}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}