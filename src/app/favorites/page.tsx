'use client';

import { useFavorites } from '@/app/store/favorites';
// import Header from '@/app/components/Header';
import Link from 'next/link';

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* <Header /> */}
      <main className="flex-1 p-6 max-w-6xl mx-auto">
        <h1 className="text-4xl text-amber-500 mb-4">Favoritos</h1>
        {favorites.length === 0 && <p>Você não tem cartas favoritas.</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {favorites.map((card) => (
            <Link key={card.id} href={`/card/${card.name}`}>
              <img
                src={card.image}
                alt={card.name}
                className="rounded-xl hover:scale-105 transition"
              />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
