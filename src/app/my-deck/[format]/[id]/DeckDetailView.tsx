/* eslint-disable no-unused-labels */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { ScryfallCard } from '@/app/lib/scryfall';
import type { DeckDetailViewProps, DeckCard } from '@/app/lib/types';

// Importando os novos componentes filhos
import CreatorHeader from './components/CreatorHeader';
import DeckHeader from './components/DeckHeader';
import DeckListView from '@/app/components/deck/DeckListView';
import DeckGridView from '@/app/components/deck/DeckGridView';
import DeckAnalytics from './components/DeckAnalytics'; // Novo componente
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Droplets, List, LayoutGrid } from 'lucide-react';
import type { GridCardData } from '@/app/components/deck/DeckGridView';

export default function DeckDetailView({
  initialDeck,
  initialScryfallMapArray,
  currentUser,
  creatorProfile,
  isInitiallySaved,
}: DeckDetailViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const scryfallCardMap = useMemo(() => new Map<string, ScryfallCard>(initialScryfallMapArray as any), [initialScryfallMapArray]);

  // A sua lógica `useMemo` para processar as cartas permanece a mesma
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
      .map((deckCard): GridCardData | null => {
        const cardData = scryfallCardMap.get(deckCard.name);
        if (!cardData) return null;
        return {
          id: cardData.id,
          name: deckCard.name,
          type_line: cardData.type_line,
          image_uris: cardData.image_uris,
          count: deckCard.count,
          mana_cost: cardData.mana_cost || '',
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

    planeswalkerCards: for (const c of allCardsWithData) {
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

    const mainboardList = initialDeck.decklist.mainboard
      .filter((c) => c.name !== commander?.name)
      .map(card => ({
        ...card,
        id: scryfallCardMap.get(card.name)?.id || '',
        scryfall_id: scryfallCardMap.get(card.name)?.id || ''
      }));
    const sideboardList = (initialDeck.decklist.sideboard || []).map(card => ({
      ...card,
      id: scryfallCardMap.get(card.name)?.id || '',
      scryfall_id: scryfallCardMap.get(card.name)?.id || ''
    }));

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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8">
      <div className="max-w-screen-xl mx-auto">
        {!isOwner && <CreatorHeader profile={creatorProfile} />}
        
        <DeckHeader deck={initialDeck} isOwner={isOwner} isInitiallySaved={isInitiallySaved} />

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          <div className="lg:col-span-3 sticky top-24 self-start">
            <Image
              src={previewImageUrl || 'https://placehold.co/340x475/171717/EAB308?text=Deck'}
              alt="Pré-visualização da carta"
              width={340}
              height={475}
              className="rounded-lg shadow-lg mx-auto transition-all duration-300"
            />
          </div>

          <main className="lg:col-span-7 space-y-8">
            <div className="flex justify-end items-center gap-4">
              <span className="text-sm text-neutral-400">Visualizar como:</span>
              <div className="flex gap-1 bg-neutral-800 p-1 rounded-md">
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><List className="mr-2 h-4 w-4" />Lista</Button>
                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}><LayoutGrid className="mr-2 h-4 w-4" />Grelha</Button>
              </div>
            </div>

            {viewMode === 'list' ? (
              <DeckListView
                commanderCard={
                  commanderCard ? { card: scryfallCardMap.get(commanderCard.name)!, count: commanderCard.count } : null
                }
                mainboardGrouped={mainboardGroupedForList}
                mainboardTotalCount={mainboardListTotalCount}
                sideboardGrouped={sideboardGroupedForList}
                sideboardTotalCount={sideboardListTotalCount}
                onCardHover={(url) => setPreviewImageUrl(url)}
                onCardLeave={() => setPreviewImageUrl(defaultPreviewImageUrl)}
              />
            ) : (
              <DeckGridView
                commanderCard={commanderCard}
                planeswalkerCards={planeswalkerCards}
                mainboardCards={mainboardGridCards}
                sideboardCards={sideboardGridCards}
                onCardHover={(url) => setPreviewImageUrl(url)}
                onCardLeave={() => setPreviewImageUrl(defaultPreviewImageUrl)}
              />
            )}
          </main>
        </div>
      </div>

      {/* Deck Analytics */}
      <div className="max-w-screen-xl pt-[100px] mx-auto">
        <div className="container">
          <DeckAnalytics
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
          />
        </div>
      </div>
    </div>
  );
}