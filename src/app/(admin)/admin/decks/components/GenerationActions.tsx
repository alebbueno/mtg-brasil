'use client'

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, Trash2, Loader2 } from 'lucide-react';
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
import { deleteAiGeneration } from '@/app/actions/aiContentGeneratorActions';
import { toast } from 'sonner';

interface GenerationActionsProps {
  generation: {
    id: string;
    saved_deck_id: string | null;
  }
}

export default function GenerationActions({ generation }: GenerationActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAiGeneration(generation.id, generation.saved_deck_id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex justify-end gap-2">
      <Link href={`/admin/ai-generations/${generation.id}`}>
          <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" /> Ver
          </Button>
      </Link>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Apagar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-neutral-900 border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-400">Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-300">
              Esta ação não pode ser desfeita. Isso irá apagar permanentemente este registro de geração e, se o deck foi salvo, **o deck também será apagado do site**.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Sim, apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}