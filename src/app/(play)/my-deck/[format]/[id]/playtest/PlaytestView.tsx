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

// Importa todos os componentes de UI que a página controla
import ZoneViewerModal from './components/ZoneViewerModal';
import PreviewPanel from './components/PreviewPanel';
import CardDetailModal from './components/CardDetailModal';

// Sub-componente interno para renderizar as fileiras do campo de batalha
const BattlefieldSubZone = ({ zoneName, cards, onHover, onViewDetails }: { 
  zoneName: string, 
  cards: GameCard[], 
  onHover: (card: GameCard | null) => void,
  onViewDetails: (card: GameCard) => void 
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `battlefield-${zoneName}`,
    data: { zone: 'battlefield' }
  });

  if (cards.length === 0) return null;

  return (
    <div className="border-b border-neutral-800/50 pb-4 last:border-b-0">
      <h3 className="font-bold text-sm text-amber-400 mb-3 ml-1">
        {zoneName} ({cards.length})
      </h3>
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-wrap gap-2 pt-2 min-h-[150px] rounded-md transition-colors -m-2 p-2",
          isOver && "bg-amber-900/20"
        )}
      >
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
  )
};

const BATTLEFIELD_ZONE_ORDER = ['Criaturas', 'Planeswalkers', 'Batalhas', 'Artefatos', 'Encantamentos', 'Terrenos', 'Outros'];

export default function PlaytestView({ initialDecklist, initialCommanderList, initialScryfallMapArray, deckFormat }: any) {
  const playtestState = usePlaytestStore();
  const { actions } = playtestState;
  
  // --- ESTADOS DE UI ---
  const [activeCard, setActiveCard] = useState<GameCard | null>(null); // Para o 'arrastar'
  const [hoveredCard, setHoveredCard] = useState<GameCard | null>(null); // Para o painel de preview
  const [zoneViewer, setZoneViewer] = useState<{title: string, cards: GameCard[]}>({ title: '', cards: [] }); // Para o modal de ver zona
  const [detailModalCard, setDetailModalCard] = useState<GameCard | null>(null); // Para o modal de detalhes da carta

  useEffect(() => {
    const scryfallMap = new Map<string, ScryfallCard>(initialScryfallMapArray);
    actions.initializeDeck(initialDecklist, initialCommanderList, scryfallMap, deckFormat);
  }, [initialDecklist, initialCommanderList, initialScryfallMapArray, actions, deckFormat]);

  const { setNodeRef: handRef, isOver: isOverHand } = useDroppable({ id: 'hand', data: { zone: 'hand' } });
  const { setNodeRef: commandZoneRef, isOver: isOverCommandZone } = useDroppable({ id: 'commandZone', data: { zone: 'commandZone' } });
  
  const groupedBattlefield = useMemo(() => {
    const groups: Record<string, GameCard[]> = {};
    playtestState.battlefield.forEach(card => {
        let mainType = "Outros";
        if (card.type_line.includes("Land")) mainType = "Terrenos";
        else if (card.type_line.includes("Creature")) mainType = "Criaturas";
        else if (card.type_line.includes("Planeswalker")) mainType = "Planeswalkers";
        else if (card.type_line.includes("Artifact")) mainType = "Artefatos";
        else if (card.type_line.includes("Enchantment")) mainType = "Encantamentos";
        else if (card.type_line.includes("Battle")) mainType = "Batalhas";
        if (!groups[mainType]) { groups[mainType] = []; }
        groups[mainType].push(card);
        groups[mainType].sort((a,b) => (a.cmc || 0) - (b.cmc || 0));
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
    }
  };

  const handleViewZone = (title: string, cards: GameCard[]) => {
    setZoneViewer({ title, cards });
  };
    
  return (
    <DndContext sensors={sensors} onDragStart={(event) => setActiveCard(event.active.data.current?.cardObject)} onDragEnd={handleDragEnd}>
      <div className="flex h-screen max-h-screen overflow-hidden bg-neutral-950 text-white">
        <main className="flex-1 flex flex-col p-4 gap-4 relative">
          <div className="flex-grow bg-black/20 rounded-lg border border-neutral-800 p-4 overflow-y-auto space-y-4">
            {BATTLEFIELD_ZONE_ORDER.map(zoneName => (
              <BattlefieldSubZone key={zoneName} zoneName={zoneName} cards={groupedBattlefield[zoneName] || []} onHover={setHoveredCard} onViewDetails={setDetailModalCard} />
            ))}
            {playtestState.battlefield.length === 0 && (
              <div className="flex items-center justify-center h-full pointer-events-none">
                <p className="text-center text-neutral-600 text-lg">Campo de Batalha</p>
              </div>
            )}
          </div>
          <div className="flex gap-4 h-[220px]">
            <div ref={handRef} className={cn("flex-grow bg-black/20 rounded-lg p-4 border transition-colors", isOverHand ? 'border-amber-400' : 'border-neutral-800')}>
              <h2 className="font-bold mb-2 text-sm text-neutral-300">Mão: {playtestState.hand.length} cartas</h2>
              <div className="flex flex-nowrap gap-2 h-full pb-4 overflow-x-auto">
                {playtestState.hand.map(card => <InteractiveCard key={card.instanceId} card={card} zone="hand" onHover={setHoveredCard} onViewDetails={setDetailModalCard} />)}
              </div>
            </div>
            {deckFormat === 'commander' && (
              <div ref={commandZoneRef} className={cn("w-44 flex-shrink-0 bg-black/20 rounded-lg p-2 border transition-colors", isOverCommandZone ? 'border-amber-400' : 'border-neutral-800')}>
                <h2 className="font-bold text-xs text-center text-neutral-300 mb-1 flex items-center justify-center gap-1"><Crown size={14}/> Comando</h2>
                <div className="flex flex-col items-center justify-center gap-2 h-full">
                  {playtestState.commandZone.map(cmd => <InteractiveCard key={cmd.instanceId} card={cmd} zone="commandZone" onHover={setHoveredCard} onViewDetails={setDetailModalCard} />)}
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
      <DragOverlay>{activeCard ? <div className="w-28 opacity-90 rotate-3 shadow-2xl"><Image src={activeCard.image_uris?.small || ''} alt={activeCard.name} width={146} height={204} className="rounded"/></div> : null}</DragOverlay>
      <ZoneViewerModal isOpen={!!zoneViewer.title} onOpenChange={(isOpen) => !isOpen && setZoneViewer({title: '', cards: []})} zoneName={zoneViewer.title} cards={zoneViewer.cards} />
      <CardDetailModal
        isOpen={!!detailModalCard}
        onOpenChange={(isOpen) => { if (!isOpen) setDetailModalCard(null) }}
        card={detailModalCard}
      />
    </DndContext>
  );
}