/* eslint-disable no-unused-vars */
// app/my-decks/components/DeckCardItemShared.tsx
'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { User as UserIcon, Eye, Bookmark } from 'lucide-react';
import ManaCost from '@/components/ui/ManaCost';

// A tipagem do deck agora inclui os novos campos
type Deck = {
  id: string;
  name: string;
  format: string;
  representative_card_image_url: string | null;
  created_at: string;
  view_count?: number;
  save_count?: number;
  color_identity?: string[];
};

interface DeckCardItemSharedProps {
  deck: Deck;
  creatorUsername?: string | null;
  onDelete: (deckId: string) => void;
}

export default function DeckCardItemShared({ deck, creatorUsername }: DeckCardItemSharedProps) {
  // Formata a identidade de cor para o componente ManaCost (ex: {W}{U}{B})
  const manaCostString = deck.color_identity ? `{${deck.color_identity.join('}{')}}` : '';

  return (
    <Link href={`/my-deck/${deck.format}/${deck.id}`} className="block h-full">
      <Card className="bg-neutral-900 border-neutral-800 h-full flex flex-col group transition-all duration-300 hover:border-amber-500 overflow-hidden">
        <div className="relative w-full aspect-[5/3]">
          <Image
            src={deck.representative_card_image_url || 'https://placehold.co/400x240/171717/EAB308?text=Deck'}
            alt={`Carta representativa do deck ${deck.name}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          {/* Sombra para garantir a legibilidade do texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
          
          {/* ✨ NOVO: Ícones de Mana no Topo ✨ */}
          <div className="absolute top-2 right-2">
            <ManaCost cost={manaCostString} />
          </div>

          {/* Informações sobre a imagem */}
          <div className="absolute bottom-0 left-0 p-4 text-white w-full">
            <CardTitle className="text-xl truncate">{deck.name}</CardTitle>
            <CardDescription className="capitalize text-neutral-300 mt-1">{deck.format}</CardDescription>
            
            <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <UserIcon size={12} /> Por @{creatorUsername || 'desconhecido'}
                </p>
                {/* ✨ NOVO: Estatísticas de Views e Saves ✨ */}
                <div className="flex items-center gap-3 text-xs text-neutral-300">
                    <div className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{deck.view_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Bookmark size={12} />
                        <span>{deck.save_count || 0}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
