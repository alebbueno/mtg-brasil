/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// app/components/deck/EditDecklistModal.tsx
'use client';

import { useState, useActionState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Save, Loader2, TextIcon } from 'lucide-react';
//import { updateDecklistFromText } from '@/app/(site)/actions/deckActions'; // Sua Server Action
import type { Decklist } from '@/app/(site)/lib/types'; // Seus tipos

interface EditDecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: string;
  initialDecklist: Decklist; // Decklist atual do deck
  initialUserId: string; // Para passar à ação (se necessário para refetch)
  onDeckUpdated: (deck: any) => void; // Callback para o componente pai atualizar o deck
}

export function EditDecklistModal({
  isOpen,
  onClose,
  deckId,
  initialDecklist,
  initialUserId,
  onDeckUpdated,
}: EditDecklistModalProps) {
  // Converte a decklist atual em texto para preencher o textarea
  const formatDecklistForTextarea = (decklist: Decklist): string => {
    let text = '';
    initialDecklist.mainboard.forEach(card => {
      text += `${card.count} ${card.name}\n`;
    });
    if (initialDecklist.sideboard && initialDecklist.sideboard.length > 0) {
      text += '\nSideboard\n';
      initialDecklist.sideboard.forEach(card => {
        text += `${card.count} ${card.name}\n`;
      });
    }
    return text.trim();
  };

  const [decklistTextInput, setDecklistTextInput] = useState(
    formatDecklistForTextarea(initialDecklist)
  );

  // Re-inicializa o textarea se a decklist inicial mudar (ex: se o modal for reaberto para outro deck)
  useEffect(() => {
    setDecklistTextInput(formatDecklistForTextarea(initialDecklist));
  }, [initialDecklist]);

  const [state, formAction] = useActionState(async (prevState: any, formData: FormData) => {
    const text = formData.get('decklistText') as string;
    if (!text) {
      return { success: false, message: 'Nenhuma lista de cartas fornecida.' };
    }

    // const result = await updateDecklistFromText(deckId, text);

    // if (result.success) {
    //   // Re-fetch o deck atualizado do DB para garantir que o estado do pai esteja correto
    //   // Nota: getDeckForEdit precisa retornar o DeckFromDB completo
    //   const { getDeckForEdit } = await import('@/app/(site)/actions/deckActions'); // Import dinâmico para evitar circular dependency
    //   const updatedDeck = await getDeckForEdit(deckId, initialUserId);
    //   if (updatedDeck) {
    //     onDeckUpdated(updatedDeck); // Notifica o componente pai para atualizar o deck
    //   }
    //   onClose(); // Fecha o modal no sucesso
    // }
    return "result";
  }, { success: false, message: '' });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-neutral-900 text-neutral-100 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-amber-500 flex items-center gap-2">
            <TextIcon /> Editar Lista de Cartas
          </DialogTitle>
          <DialogDescription className="text-neutral-300">
            Cole a sua lista de cartas aqui. O formato esperado é &quot;Quantidade Nome da Carta&quot; por linha. Use &quot;Sideboard&quot; para separar.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4 py-4">
          <input type="hidden" name="deckId" value={deckId} /> {/* Garantir que o deckId seja enviado */}
          <div className="space-y-2">
            <Label htmlFor="decklistText" className="text-neutral-300">Lista de Cartas:</Label>
            <Textarea
              id="decklistText"
              name="decklistText"
              rows={15}
              placeholder={`Exemplo:\n1 Sol Ring\n4 Swords to Plowshares\n\nSideboard\n1 Rest in Peace`}
              value={decklistTextInput}
              onChange={(e) => setDecklistTextInput(e.target.value)}
              className="bg-neutral-800 border-neutral-700 font-mono text-sm"
            />
          </div>
          {/* {state.message && (
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertTitle>{state.success ? "Sucesso!" : "Erro"}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-neutral-700 text-neutral-100 hover:bg-neutral-600 border-neutral-600">
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
              {state.pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar Lista</>}
            </Button>
          </DialogFooter> */}
        </form>
      </DialogContent>
    </Dialog>
  );
}