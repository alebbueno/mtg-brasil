/* eslint-disable no-console */
/* eslint-disable no-undef */
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { supabaseServiceClient } from '@/app/lib/supabase';
import { fetchCardsByNames } from '@/app/lib/scryfall';
import { DeckData } from '@/app/components/home/DailyDeckItem';

interface DeckDetails extends DeckData {
  strategy?: string;
  created_at: string;
}

interface DeckPageProps {
  params: {
    format: 'commander' | 'pauper' | 'modern';
    id: string;
  };
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { format, id } = params;

  // Buscar o deck no Supabase
  const { data: deck, error } = await supabaseServiceClient
    .from('daily_decks')
    .select('*')
    .eq('deck_id', id)
    .eq('format', format)
    .single();

  if (error || !deck) {
    console.error('Erro ao buscar deck:', error);
    notFound();
  }

  // Preparar lista de nomes de cartas únicas para buscar imagens
  const cardNames = [
    ...deck.decklist.mainboard.map((card: { name: any; }) => card.name),
    ...(deck.decklist.sideboard?.map((card: { name: any; }) => card.name) || []),
  ];

  // Buscar imagens das cartas no Scryfall
  const cards = await fetchCardsByNames(cardNames);
  const cardImageMap = cards.reduce((map, card) => {
    map.set(card.name, card.image_uris?.normal || 'https://via.placeholder.com/146x204');
    return map;
  }, new Map<string, string>());

  const deckDetails: DeckDetails = {
    id: deck.deck_id,
    name: deck.name,
    format: deck.format,
    representativeCard: {
      name: deck.representative_card_name,
      imageUrl: deck.representative_card_image_url,
    },
    decklist: deck.decklist,
    price: deck.price,
    strategy: deck.strategy,
    created_at: deck.created_at,
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho do Deck */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{deckDetails.name}</h1>
          <p className="text-xl text-neutral-400 capitalize">{deckDetails.format}</p>
          <p className="text-lg text-neutral-300">Preço: ${(deckDetails.price ?? 0).toFixed(2)}</p>
          <p className="text-sm text-neutral-500">
            Criado em: {new Date(deckDetails.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Carta Representativa e Estratégia */}
        <div className="mb-12 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-48 h-64 rounded-lg overflow-hidden">
            <Image
              src={deckDetails.representativeCard.imageUrl}
              alt={deckDetails.representativeCard.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Carta Principal: {deckDetails.representativeCard.name}
            </h2>
            {deckDetails.strategy && (
              <p className="text-neutral-300">{deckDetails.strategy}</p>
            )}
          </div>
        </div>

        {/* Mainboard */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Mainboard ({deckDetails.decklist.mainboard.reduce((sum, card) => sum + card.count, 0)} cartas)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {deckDetails.decklist.mainboard.map((card, index) => (
              <div key={`${card.name}-${index}`} className="relative">
                <div className="relative w-full rounded-lg overflow-hidden">
                  <Image
                        src={cardImageMap.get(card.name) || 'https://via.placeholder.com/146x204'}
                        alt={card.name}
                        width={340}
                        height={475}
                        className="rounded-lg shadow-lg w-full transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                  />
                </div>
                <div className="absolute bottom-2 left-2 bg-amber-500 bg-opacity-75 text-white text-xs font-bold px-2 py-1 rounded">
                  {card.count}x {card.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sideboard (se existir) */}
        {deckDetails.decklist.sideboard && deckDetails.decklist.sideboard.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              Sideboard ({deckDetails.decklist.sideboard.reduce((sum, card) => sum + card.count, 0)} cartas)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {deckDetails.decklist.sideboard.map((card, index) => (
                <div key={`${card.name}-${index}`} className="relative">
                  <div className="relative w-full rounded-lg overflow-hidden">
                    <Image
                        src={cardImageMap.get(card.name) || 'https://via.placeholder.com/146x204'}
                        alt={card.name}
                        width={340}
                        height={475}
                        className="rounded-lg shadow-lg w-full transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-amber-500 bg-opacity-75 text-white text-xs font-bold px-2 py-1 rounded">
                    {card.count}x {card.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}