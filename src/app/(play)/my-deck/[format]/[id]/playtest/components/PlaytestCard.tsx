/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
'use client'

import Image from 'next/image';
import { usePlaytestStore, type GameCard, type Zone } from '@/app/(play)/stores/playtest-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner'; // Importa o toast para feedback

interface PlaytestCardProps {
  card: GameCard;
  zone: Zone;
}

export default function PlaytestCard({ card, zone }: PlaytestCardProps) {
  const { actions } = usePlaytestStore();

  const handleDoubleClick = () => {
    // AJUSTE: Agora, se a carta estiver na mão OU na zona de comando,
    // um duplo clique a moverá para o campo de batalha.
    if (zone === 'hand' || zone === 'commandZone') {
      actions.moveCard(card.instanceId, zone, 'battlefield');
      // Adiciona um feedback visual para o usuário
      toast.info(`${zone === 'commandZone' ? 'Conjurou o comandante' : 'Jogou'} ${card.name}`);
    } 
    // Mantemos a funcionalidade de "matar" a criatura com duplo clique
    else if (zone === 'battlefield') {
      actions.moveCard(card.instanceId, 'battlefield', 'graveyard');
      toast.error(`${card.name} foi para o cemitério`);
    }
  };

  const handleClick = () => {
    // O clique simples só funciona para cartas no campo, para virá-las
    if (zone === 'battlefield') {
      actions.toggleTap(card.instanceId);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className="w-28 flex-shrink-0 cursor-pointer hover:-translate-y-2 transition-transform duration-200"
      title={card.name}
    >
      <Image 
        src={card.image_uris?.small || ''}
        alt={card.name}
        width={146}
        height={204}
        className={cn(
          "rounded shadow-lg pointer-events-none transition-transform duration-300",
          // Aplica a rotação se a carta estiver virada no campo de batalha
          card.tapped && zone === 'battlefield' && "rotate-90"
        )}
        unoptimized
      />
    </div>
  );
}