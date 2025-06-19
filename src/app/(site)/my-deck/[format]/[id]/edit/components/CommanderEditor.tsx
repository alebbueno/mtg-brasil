/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// app/my-deck/[format]/[id]/edit/components/CommanderEditor.tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Trash2, Library, Plus, Minus } from 'lucide-react';
import AutocompleteInput from '@/app/(site)/components/deck/AutocompleteInput';
import type { ScryfallCard } from '@/app/lib/types';
import type { EditableCard } from '../DeckEditView';

// AJUSTE: Importamos a nova função auxiliar e a action da coleção
import { upsertCardInCollection } from '@/app/actions/collectionActions';
import { fetchCardById } from '@/app/lib/scryfall';


type CommanderEditorProps = {
  cards: EditableCard[];
  setCards: React.Dispatch<React.SetStateAction<EditableCard[]>>;
  commanderName: string;
  setCommanderName: (name: string) => void;
  onCardHover: (event: React.MouseEvent, imageUrl: string | null) => void;
  onCardLeave: () => void;
  collection: Map<string, number>;
  onCollectionChange: (cardId: string, newQuantity: number) => void;
};

export default function CommanderEditor({ 
  cards, setCards, commanderName, setCommanderName, onCardHover, onCardLeave, collection, onCollectionChange
}: CommanderEditorProps) {
  
  const [isUpdatingCollection, setIsUpdatingCollection] = useState(false);

  const handleCommanderChange = (newCommander: ScryfallCard) => {
    if (!newCommander.type_line?.includes('Legendary') || !newCommander.type_line?.includes('Creature')) {
      toast.error("Apenas criaturas lendárias podem ser comandantes.");
      return;
    }
    const oldCommanderName = commanderName;
    setCards(prevCards => {
      const isAlreadyInList = prevCards.some(c => c.name === newCommander.name && c.name !== oldCommanderName);
      if (isAlreadyInList) {
        toast.error(`${newCommander.name} já está no deck. Remova-o primeiro para defini-lo como comandante.`);
        return prevCards;
      }
      const withoutOldCommander = prevCards.filter(c => c.name !== oldCommanderName);
      const newCardList: EditableCard[] = [{
        ...newCommander, count: 1, is_sideboard: false
      }, ...withoutOldCommander];
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
  const ownedCount = commanderCard ? (collection.get(commanderCard.id) || 0) : 0;

  // AJUSTE CRÍTICO: Função de atualização refatorada para garantir todos os dados
  const handleCommanderCollectionUpdate = async (newQuantity: number) => {
    if (!commanderCard) return;

    setIsUpdatingCollection(true);

    // 1. Busca os dados completos da carta usando o ID para garantir que temos tudo
    const fullCardData = await fetchCardById(commanderCard.id);

    if (!fullCardData) {
      toast.error("Não foi possível obter os detalhes completos da carta. Tente novamente.");
      setIsUpdatingCollection(false);
      return;
    }

    // 2. Prepara o objeto com os dados completos para a server action
    const collectionCardData = {
        card_scryfall_id: fullCardData.id,
        card_name: fullCardData.name,
        quantity: newQuantity,
        set_code: fullCardData.set, // Agora temos certeza que este valor existe
        set_name: fullCardData.set_name, // E este também
        collector_number: fullCardData.collector_number, // E este
        image_url: fullCardData.image_uris?.normal,
        is_foil: false,
    };

    // 3. Chama a action para salvar no banco de dados
    const result = await upsertCardInCollection(collectionCardData);

    if (!result.error) {
      onCollectionChange(commanderCard.id, newQuantity);
      toast.success(`Coleção de "${commanderCard.name}" atualizada!`);
    } else {
      toast.error(result.error || "Falha ao atualizar a coleção.");
    }
    setIsUpdatingCollection(false);
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Crown /> Comandante</CardTitle>
      </CardHeader>
      <CardContent>
        {commanderCard ? (
          <div 
            className="flex flex-col gap-2 p-2 rounded-md bg-neutral-800"
            onMouseEnter={(e) => onCardHover(e, commanderCard.image_uris?.normal || null)}
            onMouseLeave={onCardLeave}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{commanderName}</span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-500" onClick={handleRemoveCommander} aria-label="Remover comandante">
                <Trash2 size={16}/>
              </Button>
            </div>
            <div className="flex items-center gap-2 p-1 rounded-md transition-colors bg-green-500/10 border border-green-500/20">
              <Library size={14} className="text-green-400"/>
              <span className="text-xs font-medium text-green-400">Possui:</span>
              <div className="flex-grow"></div>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCommanderCollectionUpdate(ownedCount - 1)} disabled={isUpdatingCollection || ownedCount <= 0}><Minus size={16} /></Button>
              <span className="w-4 text-center font-medium text-sm">{ownedCount}</span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCommanderCollectionUpdate(ownedCount + 1)} disabled={isUpdatingCollection}><Plus size={16} /></Button>
            </div>
          </div>
        ) : (
          <AutocompleteInput onSelect={(card) => card && handleCommanderChange(card)} placeholder="Buscar novo comandante..." />
        )}
      </CardContent>
    </Card>
  );
}