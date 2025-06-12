/* eslint-disable no-unused-vars */
// app/components/deck/CardAdder.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AutocompleteInput from '@/app/components/deck/AutocompleteInput';
import { Plus } from 'lucide-react';
import type { ScryfallCard } from '@/app/lib/types';
import { toast } from 'sonner'; // Importa a função de toast

type CardAdderProps = {
  onAddCard: (card: ScryfallCard) => void;
  placeholder: string;
};

export default function CardAdder({ onAddCard, placeholder }: CardAdderProps) {
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);

  const handleAddClick = () => {
    // Só executa a ação se uma carta válida foi selecionada
    if (selectedCard) {
      onAddCard(selectedCard);
      // ✨ NOVO: Exibe uma notificação de sucesso ✨
      toast.success(`"${selectedCard.name}" adicionado ao deck.`);
      setSelectedCard(null); // Limpa o estado interno para a próxima busca
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-grow">
        <AutocompleteInput 
          onSelect={setSelectedCard} 
          placeholder={placeholder}
          // Limpa a seleção se o input for limpo manualmente (opcional, mas bom UX)
          onClear={() => setSelectedCard(null)} 
        />
      </div>
      <Button 
        type="button" 
        size="icon" 
        onClick={handleAddClick} 
        disabled={!selectedCard} // O botão fica desabilitado até uma carta ser selecionada
        aria-label="Adicionar carta"
      >
        <Plus size={18} />
      </Button>
    </div>
  );
}
