/* eslint-disable no-console */
/* eslint-disable no-undef */
'use client';

import { useEffect, useState } from 'react';
import DailyDeckItem, { DeckData } from './DailyDeckItem';

export default function DailyDecksSection() {
  const [dailyDecks, setDailyDecks] = useState<DeckData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDailyDecks() {
      try {
        const response = await fetch('/api/daily-decks');
        if (!response.ok) {
          throw new Error('Failed to fetch daily decks');
        }
        const data = await response.json();
        console.log('Dados de dailyDecks recebidos:', data);

        // Garantir que data é um array
        if (!Array.isArray(data)) {
          throw new Error('Dados recebidos não são um array');
        }

        setDailyDecks(data);
      } catch (err) {
        console.error('Erro ao buscar decks diários:', err);
        setError('Não foi possível carregar os decks do dia.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDailyDecks();
  }, []);

  if (isLoading) {
    return <div className="text-neutral-100">Carregando decks...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <section className="py-12 px-4">
      <h2 className="text-2xl font-bold text-neutral-100 mb-6">Decks do Dia</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dailyDecks.length > 0 ? (
          dailyDecks.map((deck) => (
            <DailyDeckItem key={deck.id} deck={deck} />
          ))
        ) : (
          <p className="text-neutral-400">Nenhum deck disponível hoje.</p>
        )}
      </div>
    </section>
  );
}