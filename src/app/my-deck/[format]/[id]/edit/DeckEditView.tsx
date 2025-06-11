/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// app/my-deck/[format]/[id]/edit/DeckEditView.tsx
'use client'

import { useActionState, useState, useEffect, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import Image from 'next/image';
import { updateDeckContent, updateDeckCoverImage } from '@/app/actions/deckActions';
import type { DeckFromDB, ScryfallCard } from '@/app/lib/types';

// Importando os seus componentes filhos
import DeckInfoForm from './components/DeckInfoForm';
import CardAdder from './components/CardAdder';
import CommanderEditor from './components/CommanderEditor';
import CardList from './components/CardList';
import DeckActions from './components/DeckActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

// Tipos
export interface EditableCard extends ScryfallCard {
  count: number;
  is_sideboard: boolean;
}

interface DeckEditViewProps {
  initialDeck: DeckFromDB;
  initialScryfallCards: ScryfallCard[];
}

const initialState = { message: '', success: false };

export default function DeckEditView({ initialDeck, initialScryfallCards }: DeckEditViewProps) {
  // --- STATE MANAGEMENT ---
  const editDeckWithId = updateDeckContent.bind(null, initialDeck.id);
  const [state, formAction] = useActionState(editDeckWithId, initialState);
  
  const [name, setName] = useState(initialDeck.name);
  const [description, setDescription] = useState(initialDeck.description || '');
  const [isPublic, setIsPublic] = useState(initialDeck.is_public);
  const [coverImageUrl, setCoverImageUrl] = useState(initialDeck.representative_card_image_url || '');
  
  // ✨ NOVO: Estado para gerir o popup da imagem, incluindo a sua posição ✨
  const [hoveredCard, setHoveredCard] = useState<{ imageUrl: string; x: number; y: number } | null>(null);

  const [cards, setCards] = useState<EditableCard[]>(() => {
    const scryfallMap = new Map(initialScryfallCards.map(c => [c.name, c]));
    
    const allDeckCards = [
      ...initialDeck.decklist.mainboard.map(card => ({ ...card, is_sideboard: false })),
      ...(initialDeck.decklist.sideboard || []).map(card => ({ ...card, is_sideboard: true })),
    ];

    return allDeckCards.reduce<EditableCard[]>((acc, deckCard) => {
      const scryfallData = scryfallMap.get(deckCard.name);
      if (!scryfallData) return acc;

      acc.push({
        ...scryfallData,
        count: deckCard.count,
        is_sideboard: deckCard.is_sideboard,
      });
      return acc;
    }, []);
  });

  const [commanderName, setCommanderName] = useState(() => 
    initialDeck.format === 'commander' && initialDeck.decklist.mainboard.length > 0 
      ? initialDeck.decklist.mainboard[0].name 
      : ''
  );

  // --- EFFECTS ---
  useEffect(() => {
    if (state.message) {
      toast[state.success ? 'success' : 'error'](state.message);
    }
  }, [state]);

  // --- HANDLERS ---
  const addCard = (card: ScryfallCard, isSideboard = false) => {
    if (typeof card === 'string' || !card.id) {
      toast.error("Erro: A carta selecionada é inválida.");
      return;
    }

    setCards(prev => {
      const existingCard = prev.find(c => c.id === card.id);
      if (existingCard) {
        return prev.map(c => 
          c.id === card.id ? { ...c, count: c.count + 1 } : c
        );
      }
      const newCard: EditableCard = {
        ...card,
        count: 1,
        is_sideboard: isSideboard
      };
      return [...prev, newCard];
    });
  };

  const changeCardCount = (name: string, newCount: number) => {
    if (newCount <= 0) {
      setCards(prev => prev.filter(c => c.name !== name));
    } else {
      setCards(prev => prev.map(c => c.name === name ? { ...c, count: newCount } : c));
    }
  };

  const handleCoverImageSelect = (card: ScryfallCard | null) => {
    if (!card) return;
    const newUrl = card.image_uris?.art_crop || card.image_uris?.normal || '';
    setCoverImageUrl(newUrl);
    toast.promise(updateDeckCoverImage(initialDeck.id, newUrl), {
        loading: 'A atualizar imagem de capa...',
        success: 'Imagem de capa atualizada!',
        error: 'Falha ao atualizar imagem de capa.',
    });
  };

  // ✨ CORREÇÃO: As funções de hover agora recebem o evento do rato ✨
  const handleCardHover = (event: React.MouseEvent, imageUrl: string | null) => {
    if (imageUrl) {
      setHoveredCard({ imageUrl, x: event.clientX + 20, y: event.clientY + 20 });
    }
  };
  
  const handleCardLeave = () => {
    setHoveredCard(null);
  };
  
  return (
    <>
      {/* O popup da imagem que segue o rato */}
      {hoveredCard && (
        <div
          className="pointer-events-none fixed z-50 transform"
          style={{ top: `${hoveredCard.y}px`, left: `${hoveredCard.x}px` }}
        >
          <Image
            src={hoveredCard.imageUrl}
            alt="Pré-visualização da carta"
            width={240}
            height={335}
            className="rounded-lg shadow-2xl"
          />
        </div>
      )}

      <form action={formAction} className="space-y-8">
        {/* Inputs ocultos */}
        <input type="hidden" name="cards" value={JSON.stringify(cards.map(({ name, count, is_sideboard }) => ({ name, count, is_sideboard })))} />
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="description" value={description} />
        <input type="hidden" name="is_public" value={isPublic.toString()} />
        <input type="hidden" name="cover_image_url" value={coverImageUrl} />

        <DeckActions deckId={initialDeck.id} deckName={name} onNameChange={setName} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            <DeckInfoForm
              description={description}
              onDescriptionChange={setDescription}
              isPublic={isPublic}
              onIsPublicChange={setIsPublic}
              coverImageUrl={coverImageUrl}
              onCoverImageSelect={handleCoverImageSelect}
            />
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle>Adicionar Cartas</CardTitle>
                <p className="text-xs text-neutral-500 mt-1.5 px-1 flex items-center gap-1">
                  <Info size={12} />
                  <span>Nomes em português pode falhar na busca.</span>
                </p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <CardAdder onAddCard={(card) => addCard(card, false)} placeholder="Adicionar ao Mainboard..." />
                <CardAdder onAddCard={(card) => addCard(card, true)} placeholder="Adicionar ao Sideboard..." />
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-2 space-y-6">
            {initialDeck.format === 'commander' && (
              <CommanderEditor 
                  cards={cards} 
                  setCards={setCards} 
                  commanderName={commanderName} 
                  setCommanderName={setCommanderName}
                  onCardHover={handleCardHover}
                  onCardLeave={handleCardLeave}
                />
              )}
              
              <CardList
                cards={cards}
                commanderName={commanderName}
                onCountChange={changeCardCount}
                onCardHover={handleCardHover}
                onCardLeave={handleCardLeave}
              />
          </main>
        </div>
      </form>
    </>
  );
}
