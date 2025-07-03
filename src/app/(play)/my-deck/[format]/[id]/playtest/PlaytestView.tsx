/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
'use client'

import { useEffect, useState, useMemo } from 'react';
import { usePlaytestStore, type GameCard, type Zone } from '@/app/(play)/stores/playtest-store';
import type { ScryfallCard } from '@/app/lib/types';
import Image from 'next/image';
import PlaytestSidebar from './components/PlaytestSidebar';
import InteractiveCard from './components/InteractiveCard';
import { DndContext, DragEndEvent, DragOverlay, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import ZoneViewerModal from './components/ZoneViewerModal';
import PreviewPanel from './components/PreviewPanel';
import CardDetailModal from './components/CardDetailModal';

const BattlefieldSubZone = ({ zoneName, cards, onHover, onViewDetails, heightClass }: { 
  zoneName: string, 
  cards: GameCard[], 
  onHover: (card: GameCard | null) => void,
  onViewDetails: (card: GameCard) => void,
  heightClass: string
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `battlefield-${zoneName}`,
    data: { zone: 'battlefield', subZone: zoneName }
  });

  return (
    <div className={cn("relative bg-neutral-900/30 border border-neutral-700/50 rounded-md p-2", heightClass)}>
      <h3 className="absolute top-1 left-2 font-bold text-xs text-amber-400">
        {zoneName} ({cards.length})
      </h3>
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-nowrap gap-2 pt-6 h-full overflow-x-auto",
          isOver && "bg-amber-900/20",
          cards.length === 0 && "bg-neutral-800/10"
        )}
      >
        {cards.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-neutral-500 text-sm opacity-50">{zoneName}</span>
          </div>
        )}
        {cards.map(card => (
          <InteractiveCard 
            key={card.instanceId} 
            card={card} 
            zone="battlefield" 
            onHover={onHover} 
            onViewDetails={onViewDetails} 
          />
        ))}
      </div>
    </div>
  );
};

const BATTLEFIELD_ZONES = [
  { name: 'Criaturas', height: 'h-64' },
  { name: 'Planeswalkers', height: 'h-64' },
  { name: 'Encantamentos, Artefatos e Outros', height: 'h-32' },
  { name: 'Terrenos', height: 'h-32' }
];

export default function PlaytestView({ initialDecklist, initialCommanderList, initialScryfallMapArray, deckFormat }: any) {
  const playtestState = usePlaytestStore();
  const { actions } = playtestState;
  
  const [activeCard, setActiveCard] = useState<GameCard | null>(null);
  const [hoveredCard, setHoveredCard] = useState<GameCard | null>(null);
  const [zoneViewer, setZoneViewer] = useState<{title: string, cards: GameCard[]}>({ title: '', cards: [] });
  const [detailModalCard, setDetailModalCard] = useState<GameCard | null>(null);

  useEffect(() => {
    const scryfallMap = new Map<string, ScryfallCard>(initialScryfallMapArray);
    actions.initializeDeck(initialDecklist, initialCommanderList, scryfallMap, deckFormat);
  }, [initialDecklist, initialCommanderList, initialScryfallMapArray, actions, deckFormat]);

  const { setNodeRef: handRef, isOver: isOverHand } = useDroppable({ id: 'hand', data: { zone: 'hand' } });
  const { setNodeRef: commandZoneRef, isOver: isOverCommandZone } = useDroppable({ id: 'commandZone', data: { zone: 'commandZone' } });

  const groupedBattlefield = useMemo(() => {
    const groups: Record<string, GameCard[]> = {
      'Criaturas': [],
      'Planeswalkers': [],
      'Encantamentos, Artefatos e Outros': [],
      'Terrenos': []
    };
    playtestState.battlefield.forEach(card => {
      let mainType = 'Encantamentos, Artefatos e Outros';
      if (card.type_line.includes('Land')) mainType = 'Terrenos';
      else if (card.type_line.includes('Creature')) mainType = 'Criaturas';
      else if (card.type_line.includes('Planeswalker')) mainType = 'Planeswalkers';
      groups[mainType].push(card);
      groups[mainType].sort((a, b) => (a.cmc || 0) - (b.cmc || 0));
    });
    return groups;
  }, [playtestState.battlefield]);

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { distance: 10 }, 
      onActivation: ({ event }) => (event as PointerEvent).button === 0 
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;
    const fromZone = active.data.current?.fromZone as Zone;
    const toZone = over.data.current?.zone as Zone;
    const cardId = active.id as string;
    if (fromZone && toZone && fromZone !== toZone) {
      actions.moveCard(cardId, fromZone, toZone);
    } else if (fromZone === 'battlefield' && toZone === 'battlefield') {
      const targetSubZone = over.data.current?.subZone;
      const card = playtestState.battlefield.find(c => c.instanceId === cardId);
      if (card && targetSubZone && (
        (targetSubZone === 'Terrenos' && card.type_line.includes('Land')) ||
        (targetSubZone === 'Criaturas' && card.type_line.includes('Creature')) ||
        (targetSubZone === 'Planeswalkers' && card.type_line.includes('Planeswalker')) ||
        (targetSubZone === 'Encantamentos, Artefatos e Outros' && 
          !card.type_line.includes('Land') && 
          !card.type_line.includes('Creature') && 
          !card.type_line.includes('Planeswalker'))
      )) {
        actions.moveCard(cardId, fromZone, toZone);
      }
    }
  };

  const handleViewZone = (title: string, cards: GameCard[]) => {
    setZoneViewer({ title, cards });
  };
    
  return (
    <DndContext sensors={sensors} onDragStart={(event) => setActiveCard(event.active.data.current?.cardObject)} onDragEnd={handleDragEnd}>
      <div className="flex h-screen max-h-screen bg-neutral-950 text-white">
        <main className="flex-1 flex flex-col p-4 gap-2">
          <div className="grid grid-cols-3 h-[calc(100%-240px)]">
            <BattlefieldSubZone 
              zoneName="Criaturas" 
              cards={groupedBattlefield['Criaturas'] || []} 
              onHover={setHoveredCard} 
              onViewDetails={setDetailModalCard} 
              heightClass=" col-span-2"
            />
            <BattlefieldSubZone 
              zoneName="Planeswalkers" 
              cards={groupedBattlefield['Planeswalkers'] || []} 
              onHover={setHoveredCard} 
              onViewDetails={setDetailModalCard} 
              heightClass=" col-span-1"
            />
            <BattlefieldSubZone 
              zoneName="Encantamentos, Artefatos e Outros" 
              cards={groupedBattlefield['Encantamentos, Artefatos e Outros'] || []} 
              onHover={setHoveredCard} 
              onViewDetails={setDetailModalCard} 
              heightClass=" col-span-3"
            />
            <BattlefieldSubZone 
              zoneName="Terrenos" 
              cards={groupedBattlefield['Terrenos'] || []} 
              onHover={setHoveredCard} 
              onViewDetails={setDetailModalCard} 
              heightClass=" col-span-3"
            />
          </div>
          <div className="flex gap-4 h-[220px]">
            <div ref={handRef} className={cn("flex-grow bg-black/20 rounded-lg p-4 border transition-colors", isOverHand ? 'border-amber-400' : 'border-neutral-800')}>
              <h2 className="font-bold mb-2 text-sm text-neutral-300">Mão: {playtestState.hand.length} cartas</h2>
              <div className="flex flex-nowrap gap-2 h-full pb-4 overflow-x-auto">
                {playtestState.hand.map(card => (
                  <InteractiveCard 
                    key={card.instanceId} 
                    card={card} 
                    zone="hand" 
                    onHover={setHoveredCard} 
                    onViewDetails={setDetailModalCard} 
                  />
                ))}
              </div>
            </div>
            {deckFormat === 'commander' && (
              <div ref={commandZoneRef} className={cn("w-44 flex-shrink-0 bg-black/20 rounded-lg p-2 border transition-colors", isOverCommandZone ? 'border-amber-400' : 'border-neutral-800')}>
                <h2 className="font-bold text-xs text-center text-neutral-300 mb-1 flex items-center justify-center gap-1"><Crown size={14}/> Comando</h2>
                <div className="flex flex-col items-center justify-center gap-2 h-full">
                  {playtestState.commandZone.map(cmd => (
                    <InteractiveCard 
                      key={cmd.instanceId} 
                      card={cmd} 
                      zone="commandZone" 
                      onHover={setHoveredCard} 
                      onViewDetails={setDetailModalCard} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <PreviewPanel 
            imageUrl={hoveredCard?.image_uris?.normal || null}
            manaCost={hoveredCard && hoveredCard.zone === 'hand' ? hoveredCard.mana_cost : null}
          />
        </main>
        <PlaytestSidebar deckFormat={deckFormat} onViewZone={handleViewZone} />
      </div>
      <DragOverlay>{activeCard ? <div className="w-28 opacity-90 rotate-3 shadow-2xl"><Image src={activeCard.image_uris?.small || ''} alt={activeCard.name} width={146} height={204} unoptimized className="rounded"/></div> : null}</DragOverlay>
      <ZoneViewerModal isOpen={!!zoneViewer.title} onOpenChange={(isOpen) => !isOpen && setZoneViewer({title: '', cards: []})} zoneName={zoneViewer.title} cards={zoneViewer.cards} />
      <CardDetailModal
        isOpen={!!detailModalCard}
        onOpenChange={(isOpen) => { if (!isOpen) setDetailModalCard(null) }}
        card={detailModalCard}
      />
    </DndContext>
  );
}