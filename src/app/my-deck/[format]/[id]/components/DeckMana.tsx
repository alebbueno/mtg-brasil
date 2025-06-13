/* eslint-disable no-unused-vars */
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
import type { DeckCard, DeckFromDB } from '@/app/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart } from 'lucide-react';
import ManaCost from '@/components/ui/ManaCost';
import DeckAIAnalysis from './DeckAnalytics';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DeckManaProps {
  decklist: {
    mainboard: DeckCard[];
    sideboard?: DeckCard[];
  };
  scryfallCardMap: Map<string, ScryfallCard>;
  description?: string;
  deck: DeckFromDB;
}

export default function DeckMana({ decklist, scryfallCardMap, deck }: DeckManaProps) {
  const manaStats = useMemo(() => {
    const manaSymbols: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    const landManaProduction: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    let totalCMC = 0;
    let totalNonLandCards = 0;
    let landCount = 0;
    let nonLandCount = 0;
    const cmcDistribution: number[] = Array(8).fill(0);

    decklist.mainboard.forEach(({ name, count }) => {
      const card = scryfallCardMap.get(name);
      if (!card) return;

      const processSymbols = (manaCost: string) => {
        const symbols = manaCost.match(/{[WUBRGC]}/g) ?? [];
        symbols.forEach((symbol) => {
          const type = (symbol as string).replace(/[{}]/g, '');
          if (manaSymbols[type] !== undefined) {
            manaSymbols[type] += count;
          }
        });
      };

      if (card.type_line.includes('Land')) {
        landCount += count;
        if (card.mana_cost) {
          processSymbols(card.mana_cost);
        }
      } else {
        nonLandCount += count;
        totalNonLandCards += count;

        const cmc = card.cmc || 0;
        totalCMC += cmc * count;
        if (cmc >= 7) {
          cmcDistribution[7] += count;
        } else {
          cmcDistribution[Math.floor(cmc)] += count;
        }

        if (card.mana_cost) {
          processSymbols(card.mana_cost);
        }
      }
    });

    const totalManaValue = totalCMC;
    const avgCMC = totalNonLandCards > 0 ? (totalCMC / totalNonLandCards).toFixed(2) : '0.00';
    const landPercentage =
      totalNonLandCards + landCount > 0
        ? ((landCount / (totalNonLandCards + landCount)) * 100).toFixed(1)
        : '0.0';

    const manaPercentages = Object.fromEntries(
      Object.entries(manaSymbols).map(([type, count]) => [
        type,
        totalNonLandCards > 0 ? ((count / totalNonLandCards) * 100).toFixed(2) : '0.00',
      ])
    );

    const landManaPercentages = Object.fromEntries(
      Object.entries(landManaProduction).map(([type, count]) => [
        type,
        totalNonLandCards + landCount > 0
          ? ((count / (totalNonLandCards + landCount)) * 100).toFixed(1)
          : '0.0',
      ])
    );

    const totalCards = totalNonLandCards + landCount;
    const recommendedLands = Math.min(25, Math.max(20, Math.round(totalCards * 0.4)));

    const recommendations = Object.entries(manaPercentages)
      .filter(([_, percentage]) => parseFloat(percentage) > 0)
      .map(([type, percentage]) => {
        const landType = { W: 'Planalto', U: 'Ilha', B: 'Pântano', R: 'Montanha', G: 'Floresta' }[type] || 'Terra Incolor';
        const landCount = Math.round((parseFloat(percentage) / 100) * recommendedLands);
        return { type, landType, count: landCount };
      });

    const recommendationText = recommendations.length > 0
      ? `Seu deck tem ${recommendations
          .map(({ type }) => `${manaPercentages[type]}% de mana ${type.toLowerCase()}`)
          .join(' e ')}, considere usar ${recommendations
          .map(({ landType, count }) => `${count} ${landType}${count > 1 ? 's' : ''}`)
          .join(' e ')}.`
      : 'Seu deck não tem símbolos de mana significativos.';

    return {
      manaSymbols,
      manaPercentages,
      landManaProduction,
      landManaPercentages,
      avgCMC,
      totalManaValue,
      landCount,
      nonLandCount,
      landPercentage,
      cmcDistribution,
      recommendationText,
      totalNonLandCards,
    };
  }, [decklist.mainboard, scryfallCardMap]);

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
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Curva de Mana',
        color: '#D97706',
        font: { size: 16 },
      },
      tooltip: {
        backgroundColor: '#171717',
        titleColor: '#F5F5F5',
        bodyColor: '#F5F5F5',
      },
    },
    scales: {
      x: { ticks: { color: '#A3A3A3' }, grid: { display: false } },
      y: { ticks: { color: '#A3A3A3' }, grid: { color: '#27272A' }, beginAtZero: true },
    },
  };

  return (
    <div className="w-full bg-neutral-950 text-neutral-100 sm:p-8">
      <Card className="bg-neutral-900 border-neutral-800 w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-500">
            <BarChart className="h-5 w-5" /> Estatísticas de Mana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-neutral-400">
            <p>Terrenos: {manaStats.landCount} ({manaStats.landPercentage}% do deck)</p>
            <p>Valor Total de Mana: {manaStats.totalManaValue}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
            {['W', 'U', 'B', 'R', 'G', 'C'].map((symbol) => {
              const totalPercentage = manaStats.manaPercentages[symbol];
              const landPercentage = manaStats.landManaPercentages[symbol];
              return (
                <div key={symbol} className="text-center">
                  <ManaCost cost={`{${symbol}}`} fontSize="40px" className="w-[160px] justify-center h-[160px] mx-auto mb-2 p-0 m-0" />
                  <div className="text-neutral-300 font-medium">
                    {totalPercentage}% ({manaStats.manaSymbols[symbol]} símbolos)
                  </div>
                  <div className="w-full bg-neutral-700 h-2 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-amber-500" style={{ width: `${totalPercentage}%` }}></div>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">Terrenos: {landPercentage}%</div>
                </div>
              );
            })}
          </div>

          <div className="text-sm text-neutral-300">
            <p>{manaStats.recommendationText}</p>
          </div>

          <p className="text-xs text-neutral-500">
            * Percentagens podem não somar 100% se houver cartas multicoloridas.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 w-full">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <BarChart className="h-5 w-5" /> Curva de Mana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* ✨ NOVO: Componente de Análise com IA integrado ✨ */}
        <DeckAIAnalysis deck={deck} initialAnalysis={deck.ai_analysis} />
      </div>
    </div>
  );
}
