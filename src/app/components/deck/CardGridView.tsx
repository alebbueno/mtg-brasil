/* eslint-disable no-unused-vars */
// app/components/deck/CardGridView.tsx
'use client'

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
//import type { ScryfallCard } from '@/app/lib/scryfall';

// Tipo de dados esperado por este componente
export interface GridCardData {
  id: string;
  name: string;
  type_line: string;
  image_uris?: { normal?: string };
  count: number;
}

interface CardGridViewProps {
  cards: GridCardData[];
  onCardHover: (imageUrl: string) => void;
  onCardLeave: () => void;
}

export default function CardGridView({ cards, onCardHover, onCardLeave }: CardGridViewProps) {
  // Agrupa as cartas por tipo (Criaturas, Terrenos, etc.)
  const groupedCards = cards.reduce((acc, card) => {
    let mainType = "Outros"; // Categoria padrão
    if (card.type_line.includes("Creature")) mainType = "Criaturas";
    else if (card.type_line.includes("Land")) mainType = "Terrenos";
    else if (card.type_line.includes("Instant")) mainType = "Mágicas Instantâneas";
    else if (card.type_line.includes("Sorcery")) mainType = "Feitiços";
    else if (card.type_line.includes("Artifact")) mainType = "Artefatos";
    else if (card.type_line.includes("Enchantment")) mainType = "Encantamentos";
    else if (card.type_line.includes("Planeswalker")) mainType = "Planeswalkers";
    
    if (!acc[mainType]) {
      acc[mainType] = [];
    }
    acc[mainType].push(card);
    return acc;
  }, {} as Record<string, GridCardData[]>);

  // Define uma ordem lógica para as categorias de cartas
  const typeOrder = ["Criaturas", "Planeswalkers", "Mágicas Instantâneas", "Feitiços", "Encantamentos", "Artefatos", "Terrenos", "Outros"];

  return (
    <div className="space-y-8">
      {typeOrder.map(type => {
        const cardsOfType = groupedCards[type];
        if (!cardsOfType || cardsOfType.length === 0) return null;

        // Calcula o total de cartas nesta categoria
        const totalCount = cardsOfType.reduce((sum, card) => sum + card.count, 0);

        return (
          <div key={type}>
            <h3 className="text-xl font-bold text-amber-500 mb-4 border-b border-neutral-800 pb-2">
              {type} ({totalCount})
            </h3>
            {/* Grelha responsiva para as imagens das cartas */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
              {cardsOfType
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(card => (
                  <div
                    key={card.id}
                    className="relative"
                    onMouseEnter={() => onCardHover(card.image_uris?.normal || '')}
                    onMouseLeave={onCardLeave}
                  >
                    <div className="relative cursor-pointer transition-transform duration-200 hover:-translate-y-2">
                      {card.count > 1 && (
                        <Badge
                          className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full text-black text-xs font-bold z-10 flex items-center justify-center p-0"
                        >
                          {card.count}
                        </Badge>
                      )}
                      <Image
                        src={card.image_uris?.normal || `https://placehold.co/265x370/171717/EAB308?text=${encodeURIComponent(card.name)}`}
                        alt={card.name}
                        width={265}
                        height={370}
                        className="w-full object-contain aspect-[5/7] rounded-md shadow-lg"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
