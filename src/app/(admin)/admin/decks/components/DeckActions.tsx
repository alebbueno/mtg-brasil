'use client'

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, Edit, Trash2, Loader2 } from 'lucide-react';
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
import { deleteSiteDeck } from '@/app/actions/admin/deckAdminActions';
import { toast } from 'sonner';

interface DeckActionsProps {
  deck: {
    id: string;
  }
}

export default function DeckActions({ deck }: DeckActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSiteDeck(deck.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex justify-end gap-2">
      <Link href={`/admin/decks/view/${deck.id}`}>
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" /> Ver
        </Button>
      </Link>
      <Link href={`/admin/decks/edit/${deck.id}`}>
        <Button variant="secondary" size="sm">
          <Edit className="mr-2 h-4 w-4" /> Editar
        </Button>
      </Link>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-neutral-900 border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-400">Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-300">
              Esta ação não pode ser desfeita. Isso irá apagar permanentemente este deck do site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Sim, apagar deck
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}