// app/my-deck/[format]/[id]/EditDeckForm.tsx
'use client'

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { editDeck, deleteDeck } from '@/app/actions/deckActions';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import AutocompleteInput from '@/app/components/deck/AutocompleteInput';
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
import { toast } from "sonner";

// --- Tipos ---
interface DeckCard { count: number; name: string; }
interface Decklist { mainboard: DeckCard[]; sideboard?: DeckCard[]; }
interface DeckData { id: string; name: string; format: string; description: string | null; decklist: Decklist; is_public: boolean; }

// --- Componentes Internos ---
const initialState = { message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="bg-amber-500 text-black hover:bg-amber-600" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A guardar...</> : <><Save className="mr-2 h-4 w-4" /> Guardar Alterações</>}
    </Button>
  );
}

// --- Componente Principal do Formulário ---
export default function EditDeckForm({ deck }: { deck: DeckData }) {
  const editDeckWithId = editDeck.bind(null, deck.id);
  const [state, formAction] = useActionState(editDeckWithId, initialState);
  
  // Lógica para separar o comandante do resto da lista
  let commanderInitial = '';
  let decklistInitial = deck.decklist.mainboard;
  if (deck.format === 'commander' && deck.decklist.mainboard.length > 0) {
    commanderInitial = deck.decklist.mainboard[0].name;
    decklistInitial = deck.decklist.mainboard.slice(1);
  }

  const formatDecklistToString = (cards: DeckCard[]) => cards.map(c => `${c.count} ${c.name}`).join('\n');

  const [isPublic, setIsPublic] = useState(deck.is_public);
  const [commander, setCommander] = useState(commanderInitial);
  
  const handleDelete = async () => {
    try {
      await deleteDeck(deck.id);
      toast.success("Deck excluído com sucesso!");
      // O redirecionamento será feito pela Server Action
    } catch (error: any) {
      toast.error(error.message);
    }
  };


  return (
    <form action={formAction} className="p-8 bg-neutral-900 rounded-lg border border-neutral-800 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-lg font-semibold">Nome do Deck</Label>
        <Input id="name" name="name" required defaultValue={deck.name} className="bg-neutral-800 border-neutral-700" />
      </div>

      <div className="space-y-2">
        <Label className="text-lg font-semibold">Visibilidade</Label>
        <div className="flex items-center space-x-3 p-3 bg-neutral-800 border border-neutral-700 rounded-md h-full">
            <Switch id="is_public" name="is_public" checked={isPublic} onCheckedChange={setIsPublic} />
            <Label htmlFor="is_public" className="cursor-pointer">{isPublic ? 'Público' : 'Privado'}</Label>
        </div>
      </div>
      
      {deck.format === 'commander' && (
        <div className="space-y-2">
          <Label htmlFor="commander" className="text-lg font-semibold">Comandante</Label>
          <AutocompleteInput onSelect={setCommander} placeholder={commanderInitial} />
          <input type="hidden" name="commander" value={commander || commanderInitial} />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description" className="text-lg font-semibold">Descrição</Label>
        <Textarea id="description" name="description" defaultValue={deck.description || ''} rows={4} className="bg-neutral-800 border-neutral-700" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="decklist" className="text-lg font-semibold">Lista de Cartas</Label>
        <Textarea id="decklist" name="decklist" required defaultValue={formatDecklistToString(decklistInitial)} rows={20} className="bg-neutral-800 border-neutral-700 font-mono text-sm" />
      </div>

      {state.message && (
         <Alert variant="destructive"><AlertTitle>Erro</AlertTitle><AlertDescription>{state.message}</AlertDescription></Alert>
      )}

      <div className="flex justify-between items-center">
        {/* Botão de Excluir com Diálogo de Confirmação */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" type="button"><Trash2 className="mr-2 h-4 w-4"/>Excluir Deck</Button>
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
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Sim, excluir deck</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <SubmitButton />
      </div>
    </form>
  )
}
