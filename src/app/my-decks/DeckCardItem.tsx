/* eslint-disable no-unused-vars */
'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
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

export default function DeckCardItem({ deck, onDelete }: { deck: Deck; onDelete?: (deckId: string) => void }) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Função para lidar com a exclusão do deck
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDeck(deck.id);
      toast.success("Deck excluído com sucesso!");
      // Notifica o componente pai para remover o deck do estado
      if (onDelete) {
        onDelete(deck.id);
      }
    } catch (error: any) {
      toast.error(error.message || "Não foi possível excluir o deck.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800 h-full flex flex-col group transition-all duration-300 hover:border-amber-500">
      <CardHeader className="p-0">
        <Link href={`/my-deck/${deck.format}/${deck.id}`}>
          <div className="relative w-full aspect-[5/3] rounded-t-lg overflow-hidden">
            <Image
              src={deck.representative_card_image_url || 'https://placehold.co/400x240/171717/EAB308?text=Deck'}
              alt={`Carta representativa do deck ${deck.name}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex flex-col flex-grow">
        <Link href={`/my-deck/${deck.format}/${deck.id}`}>
          <CardTitle className="text-xl text-amber-400 group-hover:text-amber-300 truncate">{deck.name}</CardTitle>
          <CardDescription className="capitalize text-neutral-400 mt-1">{deck.format}</CardDescription>
        </Link>
        <div className="flex-grow"></div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-xs text-neutral-500">
            Criado em: {new Date(deck.created_at).toLocaleDateString('pt-BR')}
          </p>
          {/* Botões de Ação */}
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