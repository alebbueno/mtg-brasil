/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use client'

import { usePlaytestStore, type GameCard, type Zone } from '@/app/(play)/stores/playtest-store';
import { Button } from '@/components/ui/button';
import LifeCounter from './LifeCounter';
import { Library, Skull, ShieldEllipsis, Shuffle, ArrowDownToLine, Eye, Hand, Play } from 'lucide-react';
import Image from 'next/image';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";

const cardBackImg = '/card-magic.png';

// Sub-componente DroppableZone com a estrutura corrigida
function DroppableZone({ zoneId, title, count, Icon, cards, onViewZone }: { 
  zoneId: Zone, 
  title: string, 
  count: number, 
  Icon: React.ElementType, 
  cards: GameCard[],
  onViewZone: (title: string, cards: GameCard[]) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: zoneId, data: { zone: zoneId } });
  const { actions } = usePlaytestStore();
  const topCard = cards.length > 0 ? cards[0] : null;

  return (
    <div className="text-center">
      <ContextMenu>
        {/* O ContextMenuTrigger agora usa 'asChild' para passar suas props para o filho */}
        <ContextMenuTrigger asChild>
          {/* Este é o nosso elemento principal que é tanto o trigger quanto a zona de drop */}
          <div ref={setNodeRef} className={cn(
              "w-full block p-2 bg-neutral-800/50 border border-neutral-700 rounded-lg cursor-pointer transition-all duration-200 hover:border-amber-500/50",
              isOver && "border-2 border-amber-400 shadow-lg shadow-amber-500/20"
          )}>
            <p className="text-sm font-medium text-amber-400 flex items-center justify-center gap-2 mb-1">
              <Icon size={16} /> {title} ({count})
            </p>
            <div className="h-44 w-full flex items-center justify-center rounded-md">
              {topCard ? <Image src={topCard.image_uris?.small} alt={topCard.name} width={100} height={140} className="rounded pointer-events-none" unoptimized/> : <Icon size={32} className="text-neutral-600"/>}
            </div>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-60 bg-neutral-900 border-neutral-700 text-neutral-200">
          <ContextMenuItem className="cursor-pointer" onSelect={() => onViewZone(title, cards)}>
            <Eye className="mr-2 h-4 w-4" /> Ver Todas as Cartas
          </ContextMenuItem>
          
          {(zoneId === 'graveyard' || zoneId === 'exile') && topCard && (
            <>
              <ContextMenuSeparator className="bg-neutral-700" />
              <ContextMenuItem onSelect={() => actions.moveCard(topCard.instanceId, zoneId, 'hand')} className="cursor-pointer">
                <Hand className="mr-2 h-4 w-4" /> Mover para a Mão
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => actions.moveCard(topCard.instanceId, zoneId, 'battlefield')} className="cursor-pointer">
                <Play className="mr-2 h-4 w-4" /> Mover para o Campo
              </ContextMenuItem>
            </>
          )}
          {zoneId === 'graveyard' && count > 0 && (
            <ContextMenuItem onSelect={() => actions.shuffleGraveyardIntoLibrary()} className="cursor-pointer">
              <Shuffle className="mr-2 h-4 w-4" /> Embaralhar no Grimório
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}


export default function PlaytestSidebar({ deckFormat, onViewZone }: {
  deckFormat: string;
  onViewZone: (title: string, cards: GameCard[]) => void;
}) {
  const { library, graveyard, exile, actions } = usePlaytestStore();
  const isCommander = deckFormat === 'commander';
  
  return (
    <aside className="w-56 bg-neutral-900 p-4 border-l border-neutral-800 flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-lg font-bold text-center text-amber-500">Zonas</h2>
      <LifeCounter initialLife={isCommander ? 40 : 20} />
      
      <div className="text-center">
        <ContextMenu>
            <ContextMenuTrigger className="w-full relative group" aria-label="Grimório">
                <button onClick={() => actions.drawCard()} className="w-full appearance-none">
                    <p className="text-sm font-medium text-amber-400 flex items-center justify-center gap-2 mb-1"><Library size={16} /> Grimório ({library.length})</p>
                    <Image src={cardBackImg} alt="Verso da carta" width={200} height={280} unoptimized className="rounded-lg shadow-lg mx-auto transition-transform duration-200 group-hover:scale-105" />
                </button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-56 bg-neutral-900 border-neutral-700 text-neutral-200">
                <ContextMenuItem onSelect={() => actions.shuffleLibrary()} className="cursor-pointer">
                    <Shuffle className="mr-2 h-4 w-4" /> Embaralhar
                </ContextMenuItem>
                <ContextMenuItem className="cursor-pointer" onSelect={() => onViewZone("Topo do Grimório (5)", library.slice(0, 5))}>
                    <Eye className="mr-2 h-4 w-4" /> Ver as 5 do Topo
                </ContextMenuItem>
                <ContextMenuSub>
                    <ContextMenuSubTrigger><ArrowDownToLine className="mr-2 h-4 w-4"/> Millar Cartas</ContextMenuSubTrigger>
                    <ContextMenuSubContent className="bg-neutral-900 border-neutral-700 text-neutral-200">
                        <ContextMenuItem onSelect={() => actions.millCards(1)} className="cursor-pointer">Millar 1</ContextMenuItem>
                        <ContextMenuItem onSelect={() => actions.millCards(3)} className="cursor-pointer">Millar 3</ContextMenuItem>
                        <ContextMenuItem onSelect={() => actions.millCards(5)} className="cursor-pointer">Millar 5</ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
            </ContextMenuContent>
        </ContextMenu>
      </div>
      
      <DroppableZone zoneId="graveyard" title="Cemitério" count={graveyard.length} Icon={Skull} cards={graveyard} onViewZone={onViewZone} />
      <DroppableZone zoneId="exile" title="Exílio" count={exile.length} Icon={ShieldEllipsis} cards={exile} onViewZone={onViewZone} />
      
      <div className="flex-grow"></div>
      <Button onClick={() => actions.resetGame()} variant="destructive" size="sm">Reiniciar Jogo</Button>
    </aside>
  );
}