/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// app/my-decks/components/DeckCardItem.tsx
'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from '@/components/ui/card';
import { Edit, Trash2, User as UserIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteDeck } from '@/app/actions/deckActions';
import { toast } from 'sonner';

// Tipo de dados para o deck
type Deck = {
  id: string;
  name: string;
  format: string;
  representative_card_image_url: string | null;
  created_at: string;
};

// As props agora incluem o nome do criador (opcional)
interface DeckCardItemProps {
  deck: Deck;
  creatorUsername?: string | null;
  onDelete?: (deckId: string) => void;
}

export default function DeckCardItem({ deck, creatorUsername, onDelete }: DeckCardItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  // Determina se o utilizador é o dono (se não houver um nome de criador, assume-se que é)
  const isOwner = !creatorUsername;

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteDeck(deck.id);

    if (result.success) {
      toast.success(result.message);
      if (onDelete) {
        onDelete(deck.id);
      }
    } else {
      toast.error(result.message);
    }
    setIsDeleting(false);
  };
  
  // --- NOVO LAYOUT PARA DECKS GUARDADOS DE OUTROS UTILIZADORES ---
  return (
    <Link href={`/my-deck/${deck.format}/${deck.id}`}>
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
          
          {/* Informações sobre a imagem */}
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <CardTitle className="text-xl truncate">{deck.name}</CardTitle>
            <CardDescription className="capitalize text-neutral-300 mt-1">{deck.format}</CardDescription>
            {/* O nome do criador agora é exibido aqui */}
            <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-2">
              <UserIcon size={12} /> Por @{creatorUsername || 'desconhecido'}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
