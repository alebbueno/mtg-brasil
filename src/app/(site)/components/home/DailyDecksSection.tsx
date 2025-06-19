/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/components/home/DailyDecksSection.tsx
'use client'

import { useEffect, useState } from 'react';
import DailyDeckItem, { type DeckData } from './DailyDeckItem';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Swords, AlertTriangle } from 'lucide-react';

// --- Sub-componente para o Skeleton Loader ---
// Este componente imita a aparência do DailyDeckItem enquanto os dados carregam.
function DeckItemSkeleton() {
  return (
    <Card className="bg-neutral-900 border-neutral-800 h-full flex flex-col animate-pulse">
      <div className="relative w-full aspect-[5/3] bg-neutral-700 rounded-t-lg" />
      <div className="p-4 flex flex-col flex-grow">
        <Skeleton className="h-6 w-3/4 bg-neutral-700 rounded" />
        <Skeleton className="h-4 w-1/2 mt-2 bg-neutral-700 rounded" />
        <div className="flex-grow" />
        <Skeleton className="h-3 w-1/3 mt-4 bg-neutral-700 rounded" />
      </div>
    </Card>
  );
}

// --- Componente Principal da Secção ---
export default function DailyDecksSection() {
  const [dailyDecks, setDailyDecks] = useState<DeckData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDailyDecks() {
      try {
        const response = await fetch('/api/daily-decks');
        if (!response.ok) {
          throw new Error('Falha ao buscar os decks do dia');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Os dados recebidos não estão no formato esperado.');
        }
        setDailyDecks(data);
      } catch (err: any) {
        console.error('Erro ao buscar decks diários:', err);
        setError(err.message || 'Não foi possível carregar os decks do dia.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDailyDecks();
  }, []);

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        {/* Cabeçalho Melhorado */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-amber-500 flex items-center justify-center gap-3">
            <i className="ms ms-shadow ms-2x" /> {/* Ícone de mana "shadow" */}
            Decks em Destaque do Dia
          </h2>
          <p className="mt-3 text-lg text-neutral-400 max-w-2xl mx-auto">
            Descubra novas estratégias e listas populares selecionadas pela nossa comunidade e equipa.
          </p>
        </div>

        {/* Lógica de Renderização Condicional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Exibe o Skeleton Loader enquanto carrega
            <>
              <DeckItemSkeleton />
              <DeckItemSkeleton />
              <DeckItemSkeleton />
            </>
          ) : error ? (
            // Exibe uma mensagem de erro estilizada
            <div className="sm:col-span-2 lg:col-span-3 text-center py-10 px-6 border-2 border-dashed border-red-500/30 bg-red-500/5 rounded-lg">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-400">Ocorreu um Erro</h3>
              <p className="text-neutral-400 mt-2">{error}</p>
            </div>
          ) : dailyDecks.length > 0 ? (
            // Exibe os decks quando os dados são carregados
            dailyDecks.map((deck) => (
              <DailyDeckItem key={deck.id} deck={deck} />
            ))
          ) : (
            // Exibe um estado de "vazio" estilizado
            <div className="sm:col-span-2 lg:col-span-3 text-center py-10 px-6 border-2 border-dashed border-neutral-700 rounded-lg">
              <Swords className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-300">Nenhum deck em destaque hoje.</h3>
              <p className="text-neutral-500 mt-2">Por favor, volte mais tarde para ver novas listas!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
