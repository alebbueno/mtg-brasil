/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// app/my-decks/components/DeckCardItem.tsx
'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, Trash2, User as UserIcon, Eye, Bookmark } from 'lucide-react';
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

interface DeckCardItemProps {
  deck: Deck;
  onDelete?: (deckId: string) => void;
}

export default function DeckCardItem({ deck, onDelete }: DeckCardItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const manaCostString = deck.color_identity ? `{${deck.color_identity.join('}{')}}` : '';

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteDeck(deck.id);

    if (result.success) {
      toast.success(result.message);
      if (onDelete) onDelete(deck.id);
    } else {
      toast.error(result.message);
    }
    setIsDeleting(false);
  };

  const placeholderStyle = {
    backgroundColor: '#171717', // bg-neutral-900
    backgroundImage: 'radial-gradient(rgba(234, 179, 8, 0.1) 1px, transparent 1px)',
    backgroundSize: '12px 12px',
  };

  return (
    <Card className="bg-neutral-900 py-0 border-neutral-800 h-full flex flex-col group transition-all duration-300 hover:border-amber-500 overflow-hidden">
      {/* AJUSTE: O <CardHeader> foi removido. A imagem agora é filha direta do <Card> */}
      <Link href={`/my-deck/${deck.format}/${deck.id}`} className="block">
        <div className="relative w-full aspect-[5/3]">
          {deck.representative_card_image_url ? (
            <Image
              src={deck.representative_card_image_url}
              alt={`Carta representativa do deck ${deck.name}`}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center" 
              style={placeholderStyle}
            />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          <div className="absolute top-2 right-2">
              <ManaCost cost={manaCostString} />
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4 flex flex-col flex-grow">
        <Link href={`/my-deck/${deck.format}/${deck.id}`}>
          <CardTitle className="text-xl text-amber-400 group-hover:text-amber-300 truncate">{deck.name}</CardTitle>
          <CardDescription className="capitalize text-neutral-400 mt-1">{deck.format}</CardDescription>
        </Link>
        <div className="flex-grow"></div>

        <div className="flex items-center gap-4 text-xs text-neutral-400 mt-3">
            <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{deck.view_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
                <Bookmark size={14} />
                <span>{deck.save_count || 0}</span>
            </div>
        </div>

        <div className="flex justify-between items-center mt-2 pt-2 border-t border-neutral-800">
          <p className="text-xs text-neutral-500">
            Criado em: {new Date(deck.created_at).toLocaleDateString('pt-BR')}
          </p>
          <div className="flex gap-2">
            <Link href={`/my-deck/${deck.format}/${deck.id}/edit`}>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-neutral-900 border-neutral-700">
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isto irá apagar permanentemente o seu deck.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                    {isDeleting ? "A excluir..." : "Sim, excluir"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}