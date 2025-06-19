// app/components/deck/SaveDeckButton.tsx
'use client'

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { toggleSaveDeck } from '@/app/(site)/actions/deckActions';

interface SaveDeckButtonProps {
  deckId: string;
  // Recebe o estado inicial para saber se o deck já está guardado para o utilizador atual
  initialIsSaved: boolean;
}

export default function SaveDeckButton({ deckId, initialIsSaved }: SaveDeckButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggleSave = () => {
    startTransition(async () => {
      try {
        const result = await toggleSaveDeck(deckId);
        // Atualiza o estado do botão com base na resposta da ação
        setIsSaved(result.saved);
        toast.success(result.message);
      } catch (error: any) {
        toast.error(error.message || "Ocorreu um erro.");
      }
    });
  };

  return (
    <Button 
      onClick={handleToggleSave} 
      disabled={isPending}
      variant={isSaved ? "secondary" : "default"}
      className="bg-amber-500 align-center text-black hover:bg-amber-600"
    >
      {isPending ? (
        <Loader2 className=" h-4 w-4 animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck className=" h-4 w-4" />
      ) : (
        <Bookmark className=" h-4 w-4" />
      )}
    </Button>
  );
}
