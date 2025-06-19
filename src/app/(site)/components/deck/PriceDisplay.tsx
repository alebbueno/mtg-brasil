'use client';

import { DollarSign, Loader2, Landmark } from 'lucide-react';

interface PriceDisplayProps {
  priceData: { usd: number; brl: number } | null;
  isLoading: boolean;
}

export default function PriceDisplay({ priceData, isLoading }: PriceDisplayProps) {
  // Se não estiver carregando e não houver dados, não renderiza nada para manter o layout limpo.
  if (!isLoading && !priceData) {
    return null;
  }

  return (
    // O contêiner principal agora só adiciona uma margem no topo.
    <div className="mt-4 h-8 flex items-center justify-center animate-in fade-in-50 duration-300">
      {/* Estado de Loading Discreto */}
      {isLoading && (
        <div className="flex items-center text-sm text-neutral-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Buscando preço...
        </div>
      )}

      {/* Exibição dos Preços Lado a Lado */}
      {priceData && !isLoading && (
        <div className="flex items-center justify-center gap-4 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800">
          {/* Seção USD */}
          <div className="flex items-center gap-1.5 text-sm text-neutral-300">
            <DollarSign size={14} className="text-green-500" />
            <span className="font-semibold text-white">${priceData.usd.toFixed(2)}</span>
            <span className="text-xs text-neutral-400">USD</span>
          </div>

          {/* Linha divisória vertical */}
          <div className="h-4 w-px bg-neutral-700"></div>

          {/* Seção BRL */}
          <div className="flex items-center gap-1.5 text-sm text-neutral-300">
            <Landmark size={14} className="text-amber-500" />
            <span className="font-semibold text-white">R$ {priceData.brl.toFixed(2)}</span>
            <span className="text-xs text-neutral-400">(Aprox.)</span>
          </div>
        </div>
      )}
    </div>
  );
}