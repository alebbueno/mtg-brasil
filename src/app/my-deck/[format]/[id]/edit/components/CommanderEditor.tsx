/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// app/my-deck/[format]/[id]/edit/components/CommanderEditor.tsx
'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Trash2 } from 'lucide-react';
import AutocompleteInput from '@/app/components/deck/AutocompleteInput';
import type { ScryfallCard } from '@/app/lib/types';
import type { EditableCard } from '../DeckEditView';

type CommanderEditorProps = {
  cards: EditableCard[];
  setCards: React.Dispatch<React.SetStateAction<EditableCard[]>>;
  commanderName: string;
  setCommanderName: (name: string) => void;
  // ✨ CORREÇÃO: A assinatura da prop agora espera o evento do rato
  onCardHover: (event: React.MouseEvent, imageUrl: string | null) => void;
  onCardLeave: () => void;
};

export default function CommanderEditor({ cards, setCards, commanderName, setCommanderName, onCardHover, onCardLeave }: CommanderEditorProps) {
  
  const handleCommanderChange = (newCommander: ScryfallCard) => {
    if (!newCommander.type_line?.includes('Legendary') || !newCommander.type_line?.includes('Creature')) {
      toast.error("Apenas criaturas lendárias podem ser comandantes.");
      return;
    }

    const oldCommanderName = commanderName;

    setCards(prevCards => {
      const isAlreadyInList = prevCards.some(
        c => c.name === newCommander.name && c.name !== oldCommanderName
      );

      if (isAlreadyInList) {
        toast.error(`${newCommander.name} já está no deck. Remova-o primeiro para defini-lo como comandante.`);
        return prevCards;
      }
      
      const withoutOldCommander = prevCards.filter(c => c.name !== oldCommanderName);
      
      const newCardList: EditableCard[] = [
        { ...newCommander, count: 1, is_sideboard: false }, 
        ...withoutOldCommander
      ];

      return newCardList;
    });

    setCommanderName(newCommander.name); 
  };

  const handleRemoveCommander = () => {
    if (!commanderName) return;
    setCards(prev => prev.filter(c => c.name !== commanderName));
    setCommanderName('');
    toast.info(`${commanderName} removido da posição de comandante.`);
  };

  const commanderCard = cards.find(c => c.name === commanderName);

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Crown /> Comandante</CardTitle>
      </CardHeader>
      <CardContent>
        {commanderCard ? (
          <div 
            className="flex items-center justify-between p-2 rounded-md bg-neutral-800"
            // ✨ CORREÇÃO: Passa o evento (e) para o manipulador de hover
            onMouseEnter={(e) => onCardHover(e, commanderCard.image_uris?.normal || null)}
            onMouseLeave={onCardLeave}
          >
            <span className="font-semibold">{commanderName}</span>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-red-400 hover:text-red-500" 
              onClick={handleRemoveCommander}
              aria-label="Remover comandante"
            >
              <Trash2 size={16}/>
            </Button>
          </div>
        ) : (
          <AutocompleteInput onSelect={(card) => card && handleCommanderChange(card)} placeholder="Buscar novo comandante..." />
        )}
      </CardContent>
    </Card>
  );
}
