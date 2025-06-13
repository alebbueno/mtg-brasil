// app/components/deck/DeckStats.tsx
'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ScryfallCard } from '@/app/lib/scryfall';
import type { DeckCard } from '@/app/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Droplets } from 'lucide-react';
import ManaCost from '@/components/ui/ManaCost';

// Registar os componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DeckAnalyticsProps {
  decklist: {
    mainboard: DeckCard[];
    sideboard?: DeckCard[];
  };
  scryfallCardMap: Map<string, ScryfallCard>;
  description?: string | null;
}

export default function DeckAnalytics({ decklist, scryfallCardMap, description }: DeckAnalyticsProps) {
  const manaStats = useMemo(() => {
    const manaSymbols: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    const landManaProduction: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    let totalCMC = 0;
    let totalNonLandCards = 0;
    let landCount = 0;
    const cmcDistribution: number[] = Array(8).fill(0);

    const allCards = [...decklist.mainboard, ...(decklist.sideboard || [])];

    allCards.forEach(({ name, count }) => {
      const card = scryfallCardMap.get(name);
      if (!card) return;

      if (card.type_line.includes('Land')) {
        landCount += count;
        // ✨ LÓGICA CORRIGIDA: Analisa o texto do terreno para ver que mana ele produz
        const oracleText = card.oracle_text || '';
        const producedSymbols = (oracleText.match(/{[WUBRGC]}/g) || []) as string[];
        producedSymbols.forEach((symbolWithBraces) => {
          const type = symbolWithBraces.replace(/[{}]/g, '');
          if (Object.prototype.hasOwnProperty.call(landManaProduction, type)) {
            landManaProduction[type] += count;
          }
        });
      } else {
        totalNonLandCards += count;
        const cmc = card.cmc || 0;
        totalCMC += cmc * count;
        
        if (cmc >= 7) {
          cmcDistribution[7] += count;
        } else {
          cmcDistribution[Math.floor(cmc)] += count;
        }

        if (card.mana_cost) {
          const symbols = card.mana_cost.match(/{[WUBRGC]}/g) || [];
          symbols.forEach((symbolWithBraces) => {
            // ✨ CORREÇÃO DE TIPO: Garante que 'symbol' é tratado como string
            const type = String(symbolWithBraces).replace(/[{}]/g, '');
            if (Object.prototype.hasOwnProperty.call(manaSymbols, type)) {
              manaSymbols[type] += count;
            }
          });
        }
      }
    });

    const avgCMC = totalNonLandCards > 0 ? (totalCMC / totalNonLandCards).toFixed(2) : '0.00';

    return {
      manaSymbols,
      landManaProduction,
      avgCMC,
      landCount,
      nonLandCount: totalNonLandCards,
      cmcDistribution,
    };
  }, [decklist, scryfallCardMap]);

  // Configuração do gráfico da curva de mana
  const chartData = {
    labels: ['0', '1', '2', '3', '4', '5', '6', '7+'],
    datasets: [
      {
        label: 'Número de Cartas',
        data: manaStats.cmcDistribution,
        backgroundColor: '#D97706',
        borderColor: '#171717',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: '#171717',
        titleColor: '#F5F5F5',
        bodyColor: '#F5F5F5',
      },
    },
    scales: {
      x: { ticks: { color: '#A3A3A3' }, grid: { display: false } },
      y: { ticks: { color: '#A3A3A3', stepSize: 1 }, grid: { color: '#27272A' }, beginAtZero: true },
    },
  };

  return (
    <div className="w-full bg-neutral-950 text-neutral-100 space-y-6">
      <Card className="bg-neutral-900 border-neutral-800 w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-500">
            <BarChart className="h-5 w-5" /> Estatísticas do Deck
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumo Geral */}
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold">{manaStats.avgCMC}</div>
              <div className="text-xs text-neutral-400">CMC Médio</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{manaStats.nonLandCount}</div>
              <div className="text-xs text-neutral-400">Não-Terrenos</div>
            </div>
             <div>
              <div className="text-2xl font-bold">{manaStats.landCount}</div>
              <div className="text-xs text-neutral-400">Terrenos</div>
            </div>
          </div>
          
          {/* Curva de Mana */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-300 mb-2">Curva de Mana</h4>
            <div className="h-40">
              <Bar data={chartData} options={chartOptions as any} />
            </div>
          </div>

          {/* Distribuição de Cores */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-300 mb-2">Símbolos de Mana (Não-Terrenos)</h4>
            <div className="flex items-center gap-4 flex-wrap">
              {Object.entries(manaStats.manaSymbols).map(([color, count]) => {
                if (count === 0) return null;
                return (
                  <div key={color} className="flex items-center gap-1.5" title={`${count} símbolos de ${color}`}>
                    <ManaCost cost={`{${color}}`} />
                    <span className="text-sm font-medium text-neutral-200">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {description && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <Droplets /> Primer / Estratégia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert text-neutral-300 whitespace-pre-wrap">
              {description}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}