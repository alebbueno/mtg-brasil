'use client';

import { useState, useEffect } from 'react';

interface Set {
  code: string;
  name: string;
}

export function useSets() {
  const [sets, setSets] = useState<Set[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSets() {
      setIsLoading(true);
      try {
        const res = await fetch('https://api.scryfall.com/sets', {
          next: { revalidate: 86400 }, // Cache por 24 horas
        });
        if (!res.ok) {
          throw new Error(`Erro HTTP ${res.status}`);
        }
        const data = await res.json();
        const filteredSets = data.data
          .filter((set: any) => set.set_type !== 'token' && set.set_type !== 'memorabilia')
          .map((set: any) => ({
            code: set.code,
            name: set.name,
          }));
        setSets(filteredSets);
      } catch (err: any) {
        // eslint-disable-next-line no-undef, no-console
        console.error('Erro ao buscar coleções:', err.message);
        setError('Não foi possível carregar as coleções.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSets();
  }, []);

  return { sets, isLoading, error };
}