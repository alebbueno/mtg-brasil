'use client'

import { useDraggable } from '@dnd-kit/core';
import Image from 'next/image';
import { CSS } from '@dnd-kit/utilities';
import { usePlaytestStore, type GameCard, type Zone } from '@/app/(play)/stores/playtest-store';
import { cn } from '@/lib/utils';

interface DraggableCardProps {
  card: GameCard;
  zone: Zone; // A carta precisa saber em qual zona ela está
}

export default function DraggableCard({ card, zone }: DraggableCardProps) {
  const { actions } = usePlaytestStore();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.instanceId,
    data: { cardObject: card, fromZone: zone } 
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef} 
      style={style} 
      className={cn("w-28 flex-shrink-0 cursor-grab active:cursor-grabbing", isDragging && "opacity-50")}
    >
      <Image 
        src={card.image_uris?.small || ''}
        alt={card.name}
        width={146}
        height={204}
        className={cn(
          "rounded shadow-lg pointer-events-none transition-transform duration-300",
          card.tapped && "rotate-90"
        )}
        // O onClick agora vira a carta, mas só se ela estiver no campo de batalha
        onClick={(e) => {
          if (zone === 'battlefield') {
            e.stopPropagation();
            actions.toggleTap(card.instanceId);
          }
        }}
        // O Dnd Kit agora lida com o "arrastar" através dos listeners
        {...listeners} 
        {...attributes}
        unoptimized
      />
    </div>
  );
}