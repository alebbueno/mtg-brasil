/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// app/components/deck/DeckStats.tsx
'use client'

import { useMemo } from 'react';
import type { ScryfallCard } from '@/app/lib/types'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Droplets } from 'lucide-react';
import ManaCost from '@/components/ui/ManaCost';

// A prop principal será a lista de cartas com as suas quantidades
interface DeckStatsProps {
  cards: {
    count: number;
    cardData: ScryfallCard;
  }[];
}

export default function DeckStats({ cards }: DeckStatsProps) {
  // --- Calcula a Curva de Mana e a Distribuição de Cores ---
  const { manaCurve, colorDistribution, averageCMC } = useMemo(() => {
    const curve: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6+': 0 };
    const colors: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    let totalCMC = 0;
    let totalNonLandCards = 0;

    cards.forEach(({ count, cardData }) => {
      // Ignora terrenos no cálculo da curva de mana e CMC médio
      if (cardData && !cardData.type_line.includes('Land')) {
        const cmc = cardData.cmc;
        totalCMC += cmc * count;
        totalNonLandCards += count;

        if (cmc >= 6) {
          curve['6+'] = (curve['6+'] || 0) + count;
        } else {
          curve[cmc.toString()] = (curve[cmc.toString()] || 0) + count;
        }
      }
      
      // Conta os símbolos de mana para a distribuição de cores
      if (cardData?.mana_cost) {
        const manaSymbols = cardData.mana_cost.match(/{[^}]+}/g) || [];
        manaSymbols.forEach(symbolWithBraces => {
          // ✨ CORREÇÃO: Garante que a variável é tratada como string ✨
          const symbol = String(symbolWithBraces).replace(/[{}]/g, '');
          if (Object.prototype.hasOwnProperty.call(colors, symbol)) {
            colors[symbol] += count;
          }
        });
      }
    });

    const avg = totalNonLandCards > 0 ? (totalCMC / totalNonLandCards).toFixed(2) : '0.00';

    return { manaCurve: curve, colorDistribution: colors, averageCMC: avg };
  }, [cards]);

  const maxCurveCount = Math.max(...Object.values(manaCurve), 1); // Evita divisão por zero

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-500">
          <BarChart /> Estatísticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gráfico da Curva de Mana */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-300 mb-2">Curva de Mana (CMC Médio: {averageCMC})</h4>
          <div className="flex items-end justify-between gap-2 h-24">
            {Object.entries(manaCurve).map(([cmc, count]) => (
              <div key={cmc} className="flex flex-col items-center flex-1" title={`${count} carta(s) com custo ${cmc}`}>
                <div 
                  className="w-full bg-amber-500/20 rounded-t-sm hover:bg-amber-500/40 transition-colors"
                  style={{ height: `${(count / maxCurveCount) * 100}%` }}
                />
                <div className="text-xs text-neutral-400 mt-1">{count}</div>
                <div className="text-xs font-bold text-neutral-200">{cmc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuição de Cores */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-300 mb-2">Símbolos de Mana</h4>
          <div className="flex items-center gap-4 flex-wrap">
            {Object.entries(colorDistribution).map(([color, count]) => {
              if (count === 0) return null;
              return (
                <div key={color} className="flex items-center gap-1.5">
                  <ManaCost cost={`{${color}}`} />
                  <span className="text-sm font-medium text-neutral-200">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
