'use client';

import { Star, StarOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type SetHeaderProps = {
  name: string;
  released_at: string;
  card_count: number;
  icon: string;
};

export function SetHeader({ name, released_at, card_count, icon }: SetHeaderProps) {
  const [favorite, setFavorite] = useState(false);

  const toggleFavorite = () => {
    setFavorite((prev) => !prev);
  };

  return (
    <header className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/collections" className="text-amber-500 text-sm">
            ← Voltar para Coleções
          </Link>
          <h1 className="text-2xl md:text-4xl text-amber-500">{name}</h1>
          <p className="text-sm text-neutral-400">
            Lançado em {released_at} — {card_count} cartas
          </p>
        </div>
        <button
          onClick={toggleFavorite}
          className="hover:scale-110 transition"
          title="Favoritar"
        >
          {favorite ? (
            <Star className="text-amber-500" />
          ) : (
            <StarOff className="text-neutral-500" />
          )}
        </button>
      </div>

      <div className="flex justify-center">
        <img src={icon} alt={name} className="w-16 h-16 opacity-80" />
      </div>
    </header>
  );
}
