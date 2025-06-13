/* eslint-disable no-unused-vars */
// app/my-deck/[format]/[id]/edit/components/DeckActions.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deleteDecEdit } from '@/app/actions/deckActions';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="lg" type="submit" className="w-full sm:w-auto bg-amber-500 text-black hover:bg-amber-600" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A guardar...</> : <><Save className="mr-2 h-4 w-4" /> Guardar Alterações</>}
    </Button>
  );
}

type DeckActionsProps = {
  deckId: string;
  deckName: string;
  onNameChange: (name: string) => void;
};

export default function DeckActions({ deckId, deckName, onNameChange }: DeckActionsProps) {
  const handleDelete = async () => {
    toast.promise(deleteDecEdit(deckId), {
      loading: 'A excluir deck...',
      success: 'Deck excluído com sucesso! A redirecionar...',
      error: (err) => err.message || 'Não foi possível excluir o deck.',
    });
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <Input 
        value={deckName} 
        onChange={e => onNameChange(e.target.value)} 
        className="text-2xl font-bold max-w-lg h-12 bg-transparent border-neutral-700 focus:border-amber-500" 
        placeholder="Nome do Deck"
      />
      <div className="flex items-center gap-2">
        <SubmitButton />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="lg" variant="destructive" type="button"><Trash2 className="mr-2 h-4 w-4"/>Excluir</Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-neutral-900 border-neutral-700">
            <AlertDialogHeader>
              <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita. Isto irá apagar permanentemente o seu deck.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Sim, excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}