/* eslint-disable no-console */
/* eslint-disable no-undef */
'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { ScryfallCard } from '@/app/lib/types'; 
import type { DeckDetailViewProps } from '@/app/lib/types';

import CreatorHeader from './components/CreatorHeader';
import DeckHeader from './components/DeckHeader';
import DeckListView from '@/app/(site)/components/deck/DeckListView';
import DeckGridView from '@/app/(site)/components/deck/DeckGridView';
import DeckMana from './components/DeckMana';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid, Boxes } from 'lucide-react'; 
import type { GridCardData } from '@/app/(site)/components/deck/DeckGridView';

import { getCardPriceFromScryfall } from '@/app/lib/scryfall';
import { getBRLRate } from '@/lib/utils';
import PriceDisplay from '@/app/(site)/components/deck/PriceDisplay';

export default function DeckDetailView({
  initialDeck,
  initialScryfallMapArray,
  currentUser,
  creatorProfile,
  isInitiallySaved,
  userPhysicalCollection, 
}: DeckDetailViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [showPhysicalCards, setShowPhysicalCards] = useState(false);
  const scryfallCardMap = useMemo(() => new Map<string, ScryfallCard>(initialScryfallMapArray as any), [initialScryfallMapArray]);

  const {
    commanderCard,
    planeswalkerCards,
    mainboardGridCards,
    sideboardGridCards,
    mainboardGroupedForList,
    sideboardGroupedForList,
    mainboardListTotalCount,
    sideboardListTotalCount,
    defaultPreviewImageUrl,
  } = useMemo(() => {
    let commander: GridCardData | null = null;
    const featuredCardIds = new Set<string>(); 
    const planeswalkers: GridCardData[] = [];
    let previewUrl = initialDeck.representative_card_image_url;

    // Constrói uma lista completa de todas as cartas do deck com os dados Scryfall
    // E garante que cada objeto DeckCard original tenha o scryfall_id mapeado corretamente
    const allDeckCardsWithScryfallId = [
      ...(initialDeck.decklist.commander || []), // Inclui comandantes explicitamente do decklist
      ...initialDeck.decklist.mainboard,
      ...(initialDeck.decklist.sideboard || []),
    ].map(deckCard => {
      const cardData = scryfallCardMap.get(deckCard.name);
      if (!cardData) {
        console.warn(`Card data not found for: ${deckCard.name}`);
        return null;
      }
      return {
        ...deckCard, // Mantém count e name do decklist original
        scryfall_id: cardData.id, // O ID da Scryfall
        // Espalha todas as propriedades da ScryfallCard aqui também
        ...cardData,
      } as GridCardData; // Garante que o tipo seja GridCardData
    }).filter((card): card is GridCardData => card !== null);

    // Lógica para Commander (prioriza decklist.commander, senão mainboard[0] para formato commander)
    if (initialDeck.format.toLowerCase() === 'commander') {
      const potentialCommanderName = initialDeck.decklist.commander?.[0]?.name || initialDeck.decklist.mainboard[0]?.name;
      if (potentialCommanderName) {
        const foundCommander = allDeckCardsWithScryfallId.find(c => c.name === potentialCommanderName && c.type_line.includes('Legendary Creature'));
        if (foundCommander) {
          commander = foundCommander;
          if (commander.image_uris?.normal) {
            previewUrl = commander.image_uris.normal;
          }
          featuredCardIds.add(commander.id); 
        }
      }
    }

    // Lógica para Planeswalkers
    for (const c of allDeckCardsWithScryfallId) {
      if (c.type_line.includes('Planeswalker') && !featuredCardIds.has(c.id)) {
        planeswalkers.push(c);
        featuredCardIds.add(c.id); 
      }
    }
    
    // Filtra Mainboard para Grid View: Remove Commander e Planeswalkers já destacados
    const mainboardGrid = allDeckCardsWithScryfallId.filter(
      (c) => initialDeck.decklist.mainboard.some((mc) => mc.name === c.name) && !featuredCardIds.has(c.id)
    );

    // Sideboard Grid (não interage com featuredCardIds)
    const sideboardGrid = allDeckCardsWithScryfallId.filter(
      (c) => initialDeck.decklist.sideboard?.some((sc) => sc.name === c.name)
    );

    // Função auxiliar para agrupar cartas para o DeckListView
    const groupForListView = (cardsToGroup: GridCardData[]) => {
      const grouped: Record<string, { card: ScryfallCard; count: number }[]> = {};
      for (const cardData of cardsToGroup) { // Agora itera sobre GridCardData
        let mainType = 'Outros';
        if (cardData.type_line.includes('Planeswalker')) mainType = 'Planeswalkers';
        else if (cardData.type_line.includes('Creature')) mainType = 'Criaturas';
        else if (cardData.type_line.includes('Instant')) mainType = 'Mágicas Instantâneas';
        else if (cardData.type_line.includes('Sorcery')) mainType = 'Feitiços';
        else if (cardData.type_line.includes('Artifact')) mainType = 'Artefatos';
        else if (cardData.type_line.includes('Enchantment')) mainType = 'Encantamentos';
        else if (cardData.type_line.includes('Land')) mainType = 'Terrenos';
        grouped[mainType] ||= [];
        // Certifique-se de que 'card' aqui é a ScryfallCard completa
        grouped[mainType].push({ card: cardData, count: cardData.count }); 
      }
      const order = ['Planeswalkers', 'Criaturas', 'Mágicas Instantâneas', 'Feitiços', 'Encantamentos', 'Artefatos', 'Terrenos', 'Outros'];
      return Object.fromEntries(order.map((type) => [type, grouped[type] || []]));
    };

    // Prepara as listas para o DeckListView, já filtradas
    const mainboardForList = allDeckCardsWithScryfallId.filter(
      (c) => initialDeck.decklist.mainboard.some((mc) => mc.name === c.name) && !featuredCardIds.has(c.id)
    );
    const sideboardForList = allDeckCardsWithScryfallId.filter(
      (c) => initialDeck.decklist.sideboard?.some((sc) => sc.name === c.name)
    );

    return {
      commanderCard: commander,
      planeswalkerCards: planeswalkers,
      mainboardGridCards: mainboardGrid,
      sideboardGridCards: sideboardGrid,
      mainboardGroupedForList: groupForListView(mainboardForList),
      sideboardGroupedForList: groupForListView(sideboardForList),
      mainboardListTotalCount: mainboardForList.reduce((sum, c) => sum + c.count, 0),
      sideboardListTotalCount: sideboardForList.reduce((sum, c) => sum + c.count, 0),
      defaultPreviewImageUrl: previewUrl,
    };
  }, [initialDeck, scryfallCardMap]);

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(defaultPreviewImageUrl);
  const isOwner = currentUser?.id === initialDeck.user_id;

  const [selectedCardPrice, setSelectedCardPrice] = useState<{ usd: number; brl: number } | null>(null);
  const [isPriceLoading, setIsPriceLoading] = useState(false);

  const handlePriceFetch = async (card: ScryfallCard | null) => {
    if (!card) {
      setSelectedCardPrice(null);
      setIsPriceLoading(false);
      return;
    }
    setIsPriceLoading(true);
    setSelectedCardPrice(null);
    const [priceUsd, brlRate] = await Promise.all([
      getCardPriceFromScryfall(card.name),
      getBRLRate()
    ]);
    if (priceUsd) {
      setSelectedCardPrice({
        usd: priceUsd,
        brl: priceUsd * (brlRate || 5.25),
      });
    }
    setIsPriceLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8">
      
      <div className="max-w-screen-xl mx-auto">
        {!isOwner && <CreatorHeader profile={creatorProfile} />}
        <DeckHeader deck={initialDeck} isOwner={isOwner} isInitiallySaved={isInitiallySaved} creatorProfile={creatorProfile} currentUser={currentUser} />
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 self-start">
            <Image
              src={previewImageUrl || defaultPreviewImageUrl || 'https://placehold.co/340x475/171717/EAB308?text=Deck'}
              alt="Pré-visualização da carta"
              width={340}
              height={475}
              unoptimized
              className="rounded-lg shadow-lg mx-auto transition-all duration-300"
            />
            <PriceDisplay priceData={selectedCardPrice} isLoading={isPriceLoading} />
          </aside>
          <main className="lg:col-span-7 space-y-8">
            <div className="block lg:hidden w-full max-w-[280px] mx-auto">
                 <Image
                    src={previewImageUrl || defaultPreviewImageUrl || 'https://placehold.co/340x475/171717/EAB308?text=Deck'}
                    alt="Pré-visualização da carta"
                    width={280}
                    height={390}
                    unoptimized
                    className="rounded-lg shadow-lg mx-auto"
                />
                <PriceDisplay priceData={selectedCardPrice} isLoading={isPriceLoading} />
            </div>
            <div className="flex justify-end items-center gap-4">
              <span className="text-sm text-neutral-400">Visualizar como:</span>
              <div className="flex gap-1 bg-neutral-800 p-1 rounded-md">
                {currentUser && userPhysicalCollection.size > 0 && ( 
                    <Button 
                        variant={showPhysicalCards ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setShowPhysicalCards(!showPhysicalCards)}
                        title="Mostrar Cartas Físicas"
                    >
                        <Boxes className="mr-2 h-4 w-4" />Coleção
                    </Button>
                )}
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><List className="mr-2 h-4 w-4" />Lista</Button>
                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}><LayoutGrid className="mr-2 h-4 w-4" />Grelha</Button>
              </div>
            </div>
            {viewMode === 'list' ? (
              <DeckListView
                // Passa o comandante como um objeto DeckCard para DeckListView
                commanderCard={ commanderCard ? { card: scryfallCardMap.get(commanderCard.name)!, count: commanderCard.count } : null }
                mainboardGrouped={mainboardGroupedForList}
                mainboardTotalCount={mainboardListTotalCount}
                sideboardGrouped={sideboardGroupedForList}
                sideboardTotalCount={sideboardListTotalCount}
                onCardHover={(url) => setPreviewImageUrl(url)}
                onCardLeave={() => setPreviewImageUrl(defaultPreviewImageUrl)}
                onPriceFetch={handlePriceFetch}
                showPhysicalCards={showPhysicalCards} 
                userPhysicalCollection={userPhysicalCollection}
              />
            ) : (
              <DeckGridView
                commanderCard={commanderCard}
                planeswalkerCards={planeswalkerCards}
                mainboardCards={mainboardGridCards}
                sideboardCards={sideboardGridCards}
                onCardHover={(url) => setPreviewImageUrl(url)}
                onCardLeave={() => setPreviewImageUrl(defaultPreviewImageUrl)}
                onPriceFetch={handlePriceFetch}
                showPhysicalCards={showPhysicalCards} 
                userPhysicalCollection={userPhysicalCollection}
              />
            )}
          </main>
        </div>
      </div>
      <div className="max-w-screen-xl pt-[100px] mx-auto">
        <div className="container">
          <DeckMana
            decklist={{
              mainboard: initialDeck.decklist.mainboard.map(card => ({
                ...card,
                id: scryfallCardMap.get(card.name)?.id || '',
                scryfall_id: scryfallCardMap.get(card.name)?.id || ''
              })),
              sideboard: initialDeck.decklist.sideboard?.map(card => ({
                ...card,
                id: scryfallCardMap.get(card.name)?.id || '',
                scryfall_id: scryfallCardMap.get(card.name)?.id || ''
              }))
            }}
            scryfallCardMap={scryfallCardMap}
            description={initialDeck.description}
            deck={initialDeck}
          />
        </div>
      </div>
    </div>
  );
}