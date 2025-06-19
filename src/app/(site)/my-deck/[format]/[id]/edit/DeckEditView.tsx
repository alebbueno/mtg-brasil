/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// app/my-deck/[format]/[id]/edit/DeckEditView.tsx
'use client'

import { useActionState, useState, useEffect, useMemo, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import Image from 'next/image';
import { updateDeckContent, updateDeckCoverImage } from '@/app/actions/deckActions';
import type { DeckFromDB, ScryfallCard } from '@/app/lib/types';

// Importando os componentes filhos
import DeckInfoForm from './components/DeckInfoForm';
import CardAdder from './components/CardAdder';
import CommanderEditor from './components/CommanderEditor';
import CardList from './components/CardList';
import DeckActions from './components/DeckActions';
import ExportMissingCards from './components/ExportMissingCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client';

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
  const supabase = createClient();
  const editDeckWithId = updateDeckContent.bind(null, initialDeck.id);
  const [state, formAction] = useActionState(editDeckWithId, initialState);
  
  const [name, setName] = useState(initialDeck.name);
  const [description, setDescription] = useState(initialDeck.description || '');
  const [isPublic, setIsPublic] = useState(initialDeck.is_public);
  const [coverImageUrl, setCoverImageUrl] = useState(initialDeck.representative_card_image_url || '');

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<{ imageUrl: string; x: number; y: number } | null>(null);

  const [collection, setCollection] = useState<Map<string, number>>(new Map());

  const [cards, setCards] = useState<EditableCard[]>(() => {
    const scryfallMap = new Map(initialScryfallCards.map(c => [c.name, c]));
    
    const allDeckCards = [
      ...initialDeck.decklist.mainboard.map(card => ({ ...card, is_sideboard: false })),
      ...(initialDeck.decklist.sideboard || []).map(card => ({ ...card, is_sideboard: true })),
    ];

    return allDeckCards.reduce<EditableCard[]>((acc, deckCard) => {
      const scryfallData = scryfallMap.get(deckCard.name);
      if (scryfallData) {
        acc.push({
          ...scryfallData,
          count: deckCard.count,
          is_sideboard: deckCard.is_sideboard,
        });
      }
      return acc;
    }, []);
  });

  const [commanderName, setCommanderName] = useState(() => 
    initialDeck.format === 'commander' && initialDeck.decklist.mainboard.length > 0 
      ? initialDeck.decklist.mainboard[0].name 
      : ''
  );

  // AJUSTE CRÍTICO: A lógica das 'cartasFaltantes' foi corrigida para incluir
  // todos os dados necessários para a exportação da imagem (ID e URLs da imagem).
  const missingCards = useMemo(() => {
    return cards
      .map(cardInDeck => {
        const ownedCount = collection.get(cardInDeck.id) || 0;
        const neededCount = cardInDeck.count;
        const missingCount = Math.max(0, neededCount - ownedCount);
        
        return {
          id: cardInDeck.id, // ID para a prop 'key' no React
          name: cardInDeck.name,
          missing: missingCount,
          image_uris: cardInDeck.image_uris, // URL da imagem para o componente de exportação
        };
      })
      .filter(card => card.missing > 0);
  }, [cards, collection]);

  useEffect(() => {
    async function fetchUserCollection() {
      const { data, error } = await supabase
        .from('user_collections')
        .select('card_scryfall_id, quantity');
      
      if (error) {
        console.error("Erro ao buscar coleção do usuário:", error);
        toast.error("Não foi possível carregar sua coleção.");
        return;
      }
      if (data) {
        const collectionMap = new Map(data.map(item => [item.card_scryfall_id, item.quantity]));
        setCollection(collectionMap);
      }
    }
    fetchUserCollection();
  }, [supabase]);

  useEffect(() => {
    if (state.message) {
      toast[state.success ? 'success' : 'error'](state.message);
    }
  }, [state]);

  const handleCollectionChange = useCallback((cardId: string, newQuantity: number) => {
    setCollection(prevCollection => {
      const newCollection = new Map(prevCollection);
      if (newQuantity > 0) {
        newCollection.set(cardId, newQuantity);
      } else {
        newCollection.delete(cardId);
      }
      return newCollection;
    });
  }, []);

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
        is_sideboard: isSideboard,
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

  const handleCardHover = (event: React.MouseEvent, imageUrl: string | null) => {
    if (imageUrl) {
      setHoveredCard({ imageUrl, x: event.clientX + 20, y: event.clientY + 20 });
    }
  };
  
  const handleCardLeave = () => {
    setHoveredCard(null);
  };

  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !event.target.files || event.target.files.length === 0) {
      toast.error("É preciso estar logado para carregar imagens.");
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${initialDeck.id}-cover-${Date.now()}.${fileExt}`;
    const bucket = 'covers';

    setIsUploadingCover(true);

    try {
        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
        });

        if (uploadError) { throw uploadError; }

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
        if (!publicUrl) { throw new Error("Não foi possível obter o URL público da imagem."); }

        await updateDeckCoverImage(initialDeck.id, publicUrl);
        setCoverImageUrl(publicUrl);
        toast.success("Imagem de capa carregada com sucesso!");

    } catch (error: any) {
        toast.error(`Erro no upload: ${error.message}`);
    } finally {
        setIsUploadingCover(false);
        if (event.target) event.target.value = '';
    }
  };
  
  return (
    <>
      {hoveredCard && (
        <div
          className="pointer-events-none fixed z-50 transform"
          style={{ top: `${hoveredCard.y}px`, left: `${hoveredCard.x}px` }}
        >
          <Image src={hoveredCard.imageUrl} alt="Pré-visualização da carta" width={240} height={335} className="rounded-lg shadow-2xl" />
        </div>
      )}

      <form action={formAction} className="space-y-8">
        <input type="hidden" name="cards" value={JSON.stringify(cards.map(({ name, count, is_sideboard }) => ({ name, count, is_sideboard })))} />
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="description" value={description} />
        <input type="hidden" name="is_public" value={isPublic.toString()} />
        <input type="hidden" name="cover_image_url" value={coverImageUrl} />

        <DeckActions deckId={initialDeck.id} deckName={name} onNameChange={setName} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            <DeckInfoForm
              description={description} onDescriptionChange={setDescription}
              isPublic={isPublic} onIsPublicChange={setIsPublic}
              coverImageUrl={coverImageUrl} onCoverImageSelect={handleCoverImageSelect}
              onCoverImageUpload={handleCoverImageUpload}
              isUploading={isUploadingCover}
            />
            
            <ExportMissingCards missingCards={missingCards} deckName={name} />

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
                  collection={collection}
                  onCollectionChange={handleCollectionChange}
              />
            )}
              
            <CardList
              cards={cards}
              commanderName={commanderName}
              onCountChange={changeCardCount}
              onCardHover={handleCardHover}
              onCardLeave={handleCardLeave}
              collection={collection}
              onCollectionChange={handleCollectionChange}
            />
          </main>
        </div>
      </form>
    </>
  );
}