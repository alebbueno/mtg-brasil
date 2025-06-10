/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/my-deck/[format]/[id]/edit/DeckEditView.tsx
'use client';

import { useActionState, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateDeckContent, updateDeckCoverImage } from '@/app/actions/deckActions';
import type { DeckFromDB, ScryfallCard } from '@/app/lib/types';
// import type { ScryfallCard } from '@/app/lib/scryfall'; // CORREÇÃO 1: Importação corrigida

// Importando os novos componentes filhos
import DeckInfoForm from './components/DeckInfoForm';
import CardAdder from './components/CardAdder';
import CommanderEditor from './components/CommanderEditor';
import CardList from './components/CardList';
import DeckActions from './components/DeckActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  // CORREÇÃO 2: Lógica de inicialização do estado `cards` segura e correta
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
  const addCard = (card: ScryfallCard | string, isSideboard = false) => {
    // ✨ VALIDAÇÃO ADICIONADA ✨
    // Verifica se o que recebemos é um objeto com um ID, e não um texto.
    if (typeof card === 'string' || !card.id) {
      toast.error("Erro: O componente de busca não retornou uma carta válida. A carta não foi adicionada.");
      console.error("Tentativa de adicionar carta com dados inválidos:", card);
      return; // Interrompe a execução para não corromper o estado.
    }

    setCards(prev => {
      const existingCard = prev.find(c => c.id === card.id); // Busca por ID é mais seguro que por nome
      if (existingCard) {
        // Se a carta já existe, apenas incrementa a contagem
        return prev.map(c => 
          c.id === card.id ? { ...c, count: c.count + 1 } : c
        );
      }
      // Se for uma carta nova, adiciona ao array
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

  // CORREÇÃO 3: `useMemo` redundante foi removido.
  console.log("Renderizando DeckEditView. Cartas no estado:", cards);
  
  return (
    <form action={formAction} className="space-y-8">
      {/* Inputs ocultos para enviar dados não-nativos do formulário para a Server Action */}
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
            <CardHeader><CardTitle>Adicionar Cartas</CardTitle></CardHeader>
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
            />
          )}
          <CardList
            cards={cards}
            commanderName={commanderName}
            onCountChange={changeCardCount}
          />
        </main>
      </div>
    </form>
  );
}