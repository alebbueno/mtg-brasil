/* eslint-disable no-unused-vars */
'use client';

import { useState } from 'react';
import DeckForm from './DeckForm';
import AnalysisResult from './AnalysisResult';
import CardKanban from './CardKanban';
import { fetchCardsByNames } from '@/app/(site)/lib/scryfall';

// Interfaces
interface DeckAnalysisResult {
  bracket?: number;
  powerLevel?: string;
  explanation: string;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  error?: string;
}

interface CardData {
  id: string;
  name: string;
  cmc: number;
  type_line: string;
  image_uris?: { normal: string };
  isLand: boolean;
  quantity: number;
}

export default function DeckAnalyzer() {
  const [decklist, setDecklist] = useState('');
  const [format, setFormat] = useState<string>('commander');
  const [result, setResult] = useState<DeckAnalysisResult | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    setCards([]);

    try {
      // Divide a lista de deck
      const decklistArray = decklist
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line);

      // Conta quantidades de cópias
      const cardCounts: Record<string, number> = {};
      decklistArray.forEach(line => {
        const match = line.match(/^(\d+)\s+(.+)$/);
        if (match) {
          const [, quantity, name] = match;
          cardCounts[name.trim()] = parseInt(quantity, 10);
        }
      });

      // Busca dados das cartas
      const cardNames = decklistArray.map(line => line.replace(/^\d+\s+/, '').trim());
      const uniqueCardNames = [...new Set(cardNames)];
      const scryfallCards = await fetchCardsByNames(uniqueCardNames);

      // Mapeia com quantidades
      const cardData: CardData[] = scryfallCards.map(card => ({
        id: card.id,
        name: card.name,
        cmc: card.cmc || 0,
        type_line: card.type_line,
        image_uris: card.image_uris,
        isLand: card.type_line.toLowerCase().includes('land'),
        quantity: cardCounts[card.name] || 1,
      }));

      // Envia para a API
      const response = await fetch('/api/deck-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decklist: decklistArray, format }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setResult({ explanation: '', error: error || 'Erro ao analisar deck' });
        return;
      }

      const analysis: DeckAnalysisResult = await response.json();
      setResult(analysis);
      setCards(cardData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setResult({ explanation: '', error: 'Erro ao conectar com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Analisador de Deck</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulário */}
                <DeckForm
                    decklist={decklist}
                    setDecklist={setDecklist}
                    format={format}
                    setFormat={setFormat}
                    onAnalyze={handleAnalyze}
                    loading={loading}
                />
                {/* Resultado e Kanban */}
                <div className="space-y-6">
                    <AnalysisResult result={result} loading={loading} />
                </div>
            </div>
        </div>

        <div className="container mx-auto p-6">
            <CardKanban cards={cards} />
        </div>
    </div>
  );
}