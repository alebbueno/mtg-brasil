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
import type { DeckCard } from '@/app/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Droplets } from 'lucide-react';
import ManaCost from '@/components/ui/ManaCost'; // Usando o componente existente

// Registrar os componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DeckAnalyticsProps {
  decklist: {
    mainboard: DeckCard[];
    sideboard?: DeckCard[];
  };
  scryfallCardMap: Map<string, ScryfallCard>;
  description?: string; // Adicionado para suportar o Primer/Estratégia
}

export default function DeckAnalytics({ decklist, scryfallCardMap, description }: DeckAnalyticsProps) {
  // Calcular estatísticas de mana
  const manaStats = useMemo(() => {
    const manaSymbols: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    const landManaProduction: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    let totalCMC = 0;
    let totalNonLandCards = 0;
    let landCount = 0;
    let nonLandCount = 0;
    const cmcDistribution: number[] = Array(8).fill(0); // Até CMC 7+

    // Processar apenas o mainboard
    decklist.mainboard.forEach(({ name, count }) => {
      const card = scryfallCardMap.get(name);
      if (!card) return;

      if (card.type_line.includes('Land')) {
        landCount += count;
        // Contar produção de mana de terrenos
        if (card.mana_cost) {
          const symbols = card.mana_cost.match(/{[WUBRGC]\}/g) || [];
          symbols.forEach((symbol) => {
            const type = symbol.replace(/[{}]/g, '');
            if (landManaProduction[type] !== undefined) {
              landManaProduction[type] += count;
            }
          });
        }
      } else {
        nonLandCount += count;
        totalNonLandCards += count;

        // Calcular CMC apenas para cartas não-terrenos
        const cmc = card.cmc || 0;
        totalCMC += cmc * count;
        if (cmc >= 7) {
          cmcDistribution[7] += count;
        } else {
          cmcDistribution[Math.floor(cmc)] += count;
        }

        // Contar símbolos de mana apenas de cartas não-terrenos
        if (card.mana_cost) {
          const symbols = card.mana_cost.match(/{[WUBRGC]\}/g) || [];
          symbols.forEach((symbol) => {
            const type = symbol.replace(/[{}]/g, '');
            if (manaSymbols[type] !== undefined) {
              manaSymbols[type] += count;
            }
          });
        }
      }
    });

    const totalManaValue = totalCMC; // Valor total de mana é a soma do CMC de cartas não-terrenos
    const avgCMC = totalNonLandCards > 0 ? (totalCMC / totalNonLandCards).toFixed(2) : '0.00';
    const landPercentage = totalNonLandCards + landCount > 0 ? ((landCount / (totalNonLandCards + landCount)) * 100).toFixed(1) : '0.0';
    const manaPercentages = Object.fromEntries(
      Object.entries(manaSymbols).map(([type, count]) => [
        type,
        totalNonLandCards > 0 ? ((count / totalNonLandCards) * 100).toFixed(2) : '0.00',
      ])
    );
    const landManaPercentages = Object.fromEntries(
      Object.entries(landManaProduction).map(([type, count]) => [
        type,
        totalNonLandCards + landCount > 0 ? ((count / (totalNonLandCards + landCount)) * 100).toFixed(1) : '0.0',
      ])
    );

    // Recomendação de terrenos
    const totalCards = totalNonLandCards + landCount;
    const recommendedLands = Math.min(25, Math.max(20, Math.round(totalCards * 0.4))); // 40% como base, ajustado entre 20-25
    const recommendations = Object.entries(manaPercentages)
      .filter(([_, percentage]) => parseFloat(percentage) > 0)
      .map(([type, percentage]) => {
        const landType = { W: 'Planalto', U: 'Ilha', B: 'Pântano', R: 'Montanha', G: 'Floresta' }[type] || 'Terra Incolor';
        const landCount = Math.round((parseFloat(percentage) / 100) * recommendedLands);
        return { type, landType, count: landCount };
      })
      .sort((a, b) => parseFloat(b.type) - parseFloat(a.type)); // Ordenar por porcentagem decrescente

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

  // Configuração do gráfico da curva de mana com cor única
  const chartData = {
    labels: ['0', '1', '2', '3', '4', '5', '6', '7+'],
    datasets: [
      {
        label: 'Número de Cartas',
        data: manaStats.cmcDistribution,
        backgroundColor: '#D97706', // Cor única em amber-500
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
            {/* Resumo Geral */}
            <div className="text-sm text-neutral-400">
                <p>
                Terrenos: {manaStats.landCount} ({manaStats.landPercentage}% do deck)
                </p>
                <p>Valor Total de Mana: {manaStats.totalManaValue}</p>
            </div>

            {/* Distribuição de Produção de Mana */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
                {['W', 'U', 'B', 'R', 'G', 'C'].map((symbol) => {
                const totalPercentage = manaStats.manaPercentages[symbol];
                const landPercentage = manaStats.landManaPercentages[symbol];
                return (
                    <div key={symbol} className="text-center">
                    <ManaCost cost={`{${symbol}}`} fontSize="60px" className="w-[160px]  justify-center h-[160px] mx-auto mb-2 p-0 m-0" />
                    <div className="text-neutral-300 font-medium">
                        {totalPercentage}% ({manaStats.manaSymbols[symbol]} símbolos)
                    </div>
                    <div className="w-full bg-neutral-700 h-2 rounded-full overflow-hidden mt-1">
                        <div
                        className="h-full bg-amber-500"
                        style={{ width: `${totalPercentage}%` }}
                        ></div>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                        Terrenos: {landPercentage}%
                    </div>
                    </div>
                );
                })}
            </div>

            {/* Recomendação de Terrenos */}
            <div className="text-sm text-neutral-300">
                <p>{manaStats.recommendationText}</p>
            </div>

            {/* Nota sobre Percentuais */}
            <p className="text-xs text-neutral-500">
                * Percentagens podem não somar 100% se houver cartas multicoloridas.
            </p>
            </CardContent>
        </Card>

      {/* Seção Dividida: Curva de Mana e Estratégia */}
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
    </div>
  );
}