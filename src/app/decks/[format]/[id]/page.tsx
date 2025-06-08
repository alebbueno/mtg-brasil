/* eslint-disable no-undef */
/* eslint-disable no-console */
import { notFound } from 'next/navigation';
import Image from 'next/image';
// Importante: Importa a função createClient correta para Server Components
import { createClient } from '@/app/utils/supabase/server';
import { fetchCardsByNames } from '@/app/lib/scryfall';

// Definindo interfaces claras para os dados
interface DeckCard {
  count: number;
  name: string;
}

interface Decklist {
  mainboard: DeckCard[];
  sideboard?: DeckCard[];
}

// O tipo de dados que esperamos do Supabase
interface DeckFromDB {
  deck_id: string;
  name: string;
  format: 'commander' | 'pauper' | 'modern';
  representative_card_name: string;
  representative_card_image_url: string;
  decklist: Decklist;
  price: number | null;
  strategy: string | null;
  created_at: string;
}

// Componente da página com a tipagem das props definida diretamente na assinatura.
// Esta é a abordagem mais robusta para evitar erros de tipo.
export default async function DeckPage({
  params,
}: {
  params: {
    format: 'commander' | 'pauper' | 'modern';
    id: string;
  };
}) {
  const { format, id } = params;
  
  // Importante: Cria uma instância do cliente Supabase para esta requisição no servidor
  const supabase = createClient();

  // Buscar o deck no Supabase usando o cliente correto
  const { data: deck, error } = await supabase
    .from('daily_decks')
    .select<"*", DeckFromDB>("*") // Especifica o tipo de retorno para o select
    .eq('deck_id', id)
    .eq('format', format)
    .single();

  if (error || !deck) {
    console.error(`Erro ao buscar deck (ID: ${id}, Formato: ${format}):`, error);
    notFound();
  }

  // Preparar lista de nomes de cartas únicas para buscar imagens
  const cardNames = [
    ...deck.decklist.mainboard.map((card) => card.name),
    ...(deck.decklist.sideboard?.map((card) => card.name) || []),
  ];

  // Buscar imagens das cartas no Scryfall
  const cardsData = await fetchCardsByNames(cardNames);
  const cardImageMap = cardsData.reduce((map, card) => {
    if (card && card.name) {
        map.set(card.name, card.image_uris?.normal || `https://placehold.co/265x370/171717/EAB308?text=${encodeURIComponent(card.name)}`);
    }
    return map;
  }, new Map<string, string>());

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho do Deck */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{deck.name}</h1>
          <p className="text-xl text-neutral-400 capitalize">{deck.format}</p>
          <p className="text-lg text-neutral-300">Preço: R$ {(deck.price ?? 0).toFixed(2)}</p>
          <p className="text-sm text-neutral-500">
            Criado em: {new Date(deck.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Carta Representativa e Estratégia */}
        <div className="mb-12 flex flex-col sm:flex-row items-start gap-8">
          <div className="relative w-48 h-[268px] sm:w-56 sm:h-[310px] flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={deck.representative_card_image_url}
              alt={deck.representative_card_name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 192px, 224px"
              priority
            />
          </div>
          <div className="flex-grow">
            <h2 className="text-xl font-semibold mb-2">
              Carta Principal: {deck.representative_card_name}
            </h2>
            {deck.strategy && (
              <div className="prose prose-invert max-w-prose text-neutral-300">
                <p>{deck.strategy}</p>
              </div>
            )}
          </div>
        </div>

        {/* Mainboard */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Mainboard ({deck.decklist.mainboard.reduce((sum, card) => sum + card.count, 0)} cartas)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {deck.decklist.mainboard.map((card, index) => (
              <div key={`${card.name}-${index}`} className="relative group">
                <div className="relative w-full aspect-[5/7] rounded-lg overflow-hidden">
                  <Image
                    src={cardImageMap.get(card.name) || `https://placehold.co/265x370/171717/EAB308?text=${encodeURIComponent(card.name)}`}
                    alt={card.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="rounded-lg shadow-lg w-full transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">
                  {card.count}x {card.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sideboard (se existir) */}
        {deck.decklist.sideboard && deck.decklist.sideboard.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              Sideboard ({deck.decklist.sideboard.reduce((sum, card) => sum + card.count, 0)} cartas)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {deck.decklist.sideboard.map((card, index) => (
                <div key={`${card.name}-${index}`} className="relative group">
                  <div className="relative w-full aspect-[5/7] rounded-lg overflow-hidden">
                    <Image
                        src={cardImageMap.get(card.name) || `https://placehold.co/265x370/171717/EAB308?text=${encodeURIComponent(card.name)}`}
                        alt={card.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        className="rounded-lg shadow-lg w-full transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                  </div>
                  <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">
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