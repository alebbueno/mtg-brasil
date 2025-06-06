'use client';

import Image from 'next/image';
import Link from 'next/link';

export interface DeckData {
  id: string;
  name: string;
  format: 'commander' | 'pauper' | 'modern';
  representativeCard: {
    name: string;
    imageUrl: string;
  };
  decklist: {
    mainboard: { name: string; count: number }[];
    sideboard?: { name: string; count: number }[];
  };
  price?: number;
  strategy?: string;
}

interface DailyDeckItemProps {
  deck: DeckData;
}

export default function DailyDeckItem({ deck }: DailyDeckItemProps) {
  return (
    <Link href={`/decks/${deck.format}/${deck.id}`} className="block bg-neutral-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="relative w-full">
        <Image
          src={deck.representativeCard.imageUrl}
          alt={deck.representativeCard.name}
          width={340}
          height={475}
          className="rounded-lg shadow-lg w-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-neutral-100 truncate">{deck.name}</h3>
        <p className="text-neutral-400 capitalize">{deck.format}</p>
        <p className="text-neutral-300">Carta Principal: {deck.representativeCard.name}</p>
        {deck.price && (
          <p className="text-neutral-300">Preço: ${deck.price.toFixed(2)}</p>
        )}
      </div>
    </Link>
  );
}