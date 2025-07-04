/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
'use client'

import { useDraggable } from '@dnd-kit/core';
import Image from 'next/image';
import { CSS } from '@dnd-kit/utilities';
import { usePlaytestStore, type GameCard, type Zone } from '@/app/(play)/stores/playtest-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Hand, Skull, ShieldEllipsis, ArrowDownToLine, ArrowUpToLine, RefreshCw, Play, BookOpen, Crown, Plus } from 'lucide-react';

interface InteractiveCardProps {
  card: GameCard;
  zone: Zone;
  onHover: (card: GameCard | null) => void;
  onViewDetails: (card: GameCard) => void;
}

export default function InteractiveCard({ card, zone, onHover, onViewDetails }: InteractiveCardProps) {
  const { actions } = usePlaytestStore();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.instanceId,
    data: { cardObject: card, fromZone: zone },
  });

  const style = { transform: CSS.Translate.toString(transform), touchAction: 'none' };

  const handleDoubleClick = () => {
    if (zone === 'hand' || zone === 'commandZone') {
      actions.moveCard(card.instanceId, zone, 'battlefield');
      toast.info(`Jogou ${card.name}`);
    } else if (zone === 'battlefield') {
      actions.moveCard(card.instanceId, 'battlefield', 'graveyard');
      toast.info(`${card.name} foi para o cemitério`);
    }
  };

  const handleAddPowerToughnessCounters = () => {
    const powerInput = window.prompt(`Quantos marcadores de poder deseja adicionar a ${card.name}? (Ex.: 2 ou -2)`, '0');
    const toughnessInput = window.prompt(`Quantos marcadores de resistência deseja adicionar a ${card.name}? (Ex.: 2 ou -2)`, '0');
    if (powerInput !== null && toughnessInput !== null) {
      const power = parseInt(powerInput, 10);
      const toughness = parseInt(toughnessInput, 10);
      if (!isNaN(power) && !isNaN(toughness)) {
        actions.addPowerToughnessCounters(card.instanceId, power, toughness);
      } else {
        toast.warning('Por favor, insira números válidos para poder e resistência.');
      }
    }
  };

  const isCommander = card.instanceId.startsWith('cmd-');
  const isBattlefield = zone === 'battlefield';
  const cardWidth = isBattlefield ? 116 : 146; // 80% do tamanho original (146 * 0.8 ≈ 116)
  const cardHeight = isBattlefield ? 163 : 204; // 80% do tamanho original (204 * 0.8 ≈ 163)

  const CardImage = (
    <div
      onMouseEnter={() => onHover(card)}
      onMouseLeave={() => onHover(null)}
      className={cn("flex-shrink-0 relative group", isDragging && "opacity-30", isBattlefield ? "w-[116px]" : "w-28")}
      title={card.name}
    >
      <Image 
        src={card.image_uris?.small || ''}
        alt={card.name}
        width={cardWidth}
        height={cardHeight}
        className={cn(
          "rounded-md shadow-lg pointer-events-none transition-transform duration-200 group-hover:-translate-y-1", 
          card.tapped && isBattlefield && "rotate-90"
        )}
        unoptimized
      />
      {zone === 'commandZone' && card.commanderTax > 0 && (
        <div className="absolute -top-2 -right-2 bg-sky-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-neutral-900 shadow-md">
          +{card.commanderTax}
        </div>
      )}
      {zone === 'battlefield' && (card.powerCounters !== 0 || card.toughnessCounters !== 0) && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded-full flex items-center justify-center border-2 border-neutral-900 shadow-md">
          {card.powerCounters >= 0 ? '+' : ''}{card.powerCounters}/{card.toughnessCounters >= 0 ? '+' : ''}{card.toughnessCounters}
        </div>
      )}
    </div>
  );

  return (
    <div ref={setNodeRef} style={style}>
      <ContextMenu>
        <ContextMenuTrigger
          {...listeners}
          {...attributes}
          onDoubleClick={handleDoubleClick}
          className="cursor-grab active:cursor-grabbing rounded-md"
        >
          {CardImage}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-60 bg-neutral-900 border-neutral-700 text-neutral-200">
          <ContextMenuItem onSelect={() => onViewDetails(card)} className="cursor-pointer">
            <BookOpen className="mr-2 h-4 w-4" /> Ver Detalhes / Traduzir
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-neutral-700" />
          
          {zone === 'battlefield' && (
            <>
              {isCommander && (
                <>
                  <ContextMenuItem onSelect={() => actions.returnCommanderToZone(card.instanceId)} className="cursor-pointer text-amber-400 focus:text-amber-400">
                    <Crown className="mr-2 h-4 w-4" /> Voltar p/ Zona de Comando
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-neutral-700" />
                </>
              )}
              <ContextMenuItem onSelect={() => actions.toggleTap(card.instanceId)} className="cursor-pointer">
                <RefreshCw className="mr-2 h-4 w-4" /> Virar / Desvirar
              </ContextMenuItem>
              <ContextMenuItem onSelect={handleAddPowerToughnessCounters} className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Marcadores Poder/Resistência
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => actions.moveCard(card.instanceId, 'battlefield', 'hand')} className="cursor-pointer">
                <Hand className="mr-2 h-4 w-4" /> Voltar para a Mão
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => actions.moveCardToLibrary(card.instanceId, 'battlefield', 'top')} className="cursor-pointer">
                <ArrowUpToLine className="mr-2 h-4 w-4" /> Mover para o Topo
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => actions.moveCardToLibrary(card.instanceId, 'battlefield', 'bottom')} className="cursor-pointer">
                <ArrowDownToLine className="mr-2 h-4 w-4" /> Mover para o Fundo
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-neutral-700" />
              <ContextMenuItem onSelect={() => actions.moveCard(card.instanceId, 'battlefield', 'graveyard')} className="cursor-pointer text-red-400 focus:text-red-400">
                <Skull className="mr-2 h-4 w-4" /> Mover para o Cemitério
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => actions.moveCard(card.instanceId, 'battlefield', 'exile')} className="cursor-pointer">
                <ShieldEllipsis className="mr-2 h-4 w-4" /> Mover para o Exílio
              </ContextMenuItem>
            </>
          )}
          {zone === 'hand' && (
            <>
              <ContextMenuItem onSelect={() => actions.moveCard(card.instanceId, 'hand', 'battlefield')} className="cursor-pointer">
                <Play className="mr-2 h-4 w-4" /> Jogar no Campo
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => actions.moveCard(card.instanceId, 'hand', 'graveyard')} className="cursor-pointer">
                <Skull className="mr-2 h-4 w-4" /> Descartar
              </ContextMenuItem>
            </>
          )}
          {(zone === 'commandZone' || zone === 'graveyard' || zone === 'exile') && (
             <ContextMenuItem onSelect={() => actions.moveCard(card.instanceId, zone, 'battlefield')} className="cursor-pointer">
                <Play className="mr-2 h-4 w-4" /> Mover para o Campo
             </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}