'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { ScryfallCard } from '@/app/lib/types'; 
import type { DeckDetailViewProps, DeckCard } from '@/app/lib/types';

// Importando os componentes filhos
import CreatorHeader from './components/CreatorHeader';
import DeckHeader from './components/DeckHeader';
import DeckListView from '@/app/(site)/components/deck/DeckListView';
import DeckGridView from '@/app/(site)/components/deck/DeckGridView';
import DeckMana from './components/DeckMana';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid } from 'lucide-react';
import type { GridCardData } from '@/app/(site)/components/deck/DeckGridView';

// Importando as novas funções e o componente de preço
import { getCardPriceFromScryfall } from '@/app/lib/scryfall';
import { getBRLRate } from '@/lib/utils';
import PriceDisplay from '@/app/(site)/components/deck/PriceDisplay';

export default function DeckDetailView({
  initialDeck,
  initialScryfallMapArray,
  currentUser,
  creatorProfile,
  isInitiallySaved,
}: DeckDetailViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
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
    const featuredNames = new Set<string>();
    const planeswalkers: GridCardData[] = [];
    let previewUrl = initialDeck.representative_card_image_url;

    const allCardsWithData: GridCardData[] = [...initialDeck.decklist.mainboard, ...(initialDeck.decklist.sideboard || [])]
      .map((deckCard) => {
        const cardData = scryfallCardMap.get(deckCard.name);
        if (!cardData) return null;
        // Agora, ao espalhar `cardData`, o objeto corresponde ao tipo GridCardData (ScryfallCard & { count })
        return {
          ...cardData,
          count: deckCard.count,
        };
      })
      .filter((card): card is GridCardData => card !== null);

    if (initialDeck.format.toLowerCase() === 'commander' && initialDeck.decklist.mainboard.length > 0) {
      const commanderName = initialDeck.decklist.mainboard[0].name;
      commander = allCardsWithData.find((c) => c.name === commanderName) || null;
      if (commander?.image_uris?.normal) {
        previewUrl = commander.image_uris.normal;
      }
      featuredNames.add(commanderName);
    }

    for (const c of allCardsWithData) {
      if (c.type_line.includes('Planeswalker') && !featuredNames.has(c.name)) {
        planeswalkers.push(c);
        featuredNames.add(c.name);
      }
    }

    const mainboardGrid = allCardsWithData.filter(
      (c) => initialDeck.decklist.mainboard.some((mc) => mc.name === c.name) && !featuredNames.has(c.name)
    );
    const sideboardGrid = allCardsWithData.filter(
      (c) => initialDeck.decklist.sideboard?.some((sc) => sc.name === c.name)
    );
    const groupForListView = (deckCards: DeckCard[]) => {
      const grouped: Record<string, { card: ScryfallCard; count: number }[]> = {};
      for (const deckCard of deckCards) {
        const cardData = scryfallCardMap.get(deckCard.name);
        if (!cardData) continue;
        let mainType = 'Outros';
        if (cardData.type_line.includes('Planeswalker')) mainType = 'Planeswalkers';
        else if (cardData.type_line.includes('Creature')) mainType = 'Criaturas';
        else if (cardData.type_line.includes('Instant')) mainType = 'Mágicas Instantâneas';
        else if (cardData.type_line.includes('Sorcery')) mainType = 'Feitiços';
        else if (cardData.type_line.includes('Artifact')) mainType = 'Artefatos';
        else if (cardData.type_line.includes('Enchantment')) mainType = 'Encantamentos';
        else if (cardData.type_line.includes('Land')) mainType = 'Terrenos';
        grouped[mainType] ||= [];
        grouped[mainType].push({ card: cardData, count: deckCard.count });
      }
      const order = ['Planeswalkers', 'Criaturas', 'Mágicas Instantâneas', 'Feitiços', 'Encantamentos', 'Artefatos', 'Terrenos', 'Outros'];
      return Object.fromEntries(order.map((type) => [type, grouped[type] || []]));
    };
    const createDeckCard = (card: { name: string; count: number }): DeckCard => ({
      id: card.name, // Using name as a fallback id
      name: card.name,
      count: card.count,
      scryfall_id: scryfallCardMap.get(card.name)?.id || card.name
    });

    const mainboardList = initialDeck.decklist.mainboard
      .filter((c) => c.name !== commander?.name)
      .map(createDeckCard);
    const sideboardList = (initialDeck.decklist.sideboard || [])
      .map(createDeckCard);
    return {
      commanderCard: commander,
      planeswalkerCards: planeswalkers,
      mainboardGridCards: mainboardGrid,
      sideboardGridCards: sideboardGrid,
      mainboardGroupedForList: groupForListView(mainboardList),
      sideboardGroupedForList: groupForListView(sideboardList),
      mainboardListTotalCount: mainboardList.reduce((sum, c) => sum + c.count, 0),
      sideboardListTotalCount: sideboardList.reduce((sum, c) => sum + c.count, 0),
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
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><List className="mr-2 h-4 w-4" />Lista</Button>
                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}><LayoutGrid className="mr-2 h-4 w-4" />Grelha</Button>
              </div>
            </div>
            {viewMode === 'list' ? (
              <DeckListView
                commanderCard={ commanderCard ? { card: scryfallCardMap.get(commanderCard.name)!, count: commanderCard.count } : null }
                mainboardGrouped={mainboardGroupedForList}
                mainboardTotalCount={mainboardListTotalCount}
                sideboardGrouped={sideboardGroupedForList}
                sideboardTotalCount={sideboardListTotalCount}
                onCardHover={(url) => setPreviewImageUrl(url)}
                onCardLeave={() => setPreviewImageUrl(defaultPreviewImageUrl)}
                onPriceFetch={handlePriceFetch}
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