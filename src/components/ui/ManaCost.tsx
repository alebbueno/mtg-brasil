// app/components/ui/ManaCost.tsx
'use client'

import React from 'react';

// Um pequeno componente para renderizar um único símbolo de mana
function ManaSymbol({ symbol, fontSize }: { symbol: string, fontSize: string }) {
  // Converte o símbolo (ex: "U", "2", "G/U") para a classe CSS correta (ex: "ms-u", "ms-2", "ms-gu")
  // e adiciona classes de estilo. A biblioteca 'mana-font' é sensível a maiúsculas/minúsculas.
  const formattedSymbol = symbol.toLowerCase().replace('/', '');
  const className = `ms ms-${formattedSymbol} ${fontSize} ms-cost`; // ms-cost para espaçamento correto
    
  return <i className={className} style={{ fontSize: fontSize || 'inherit' }} />;
}

// O componente principal que recebe a string de custo completa
type ManaCostProps = {
  cost?: string | null; // A propriedade pode ser string, null ou undefined
  className?: string;
  fontSize?: string | null;
};

export default function ManaCost({ cost, className = '', fontSize }: ManaCostProps) {
  // Se não houver custo (null, undefined, ou string vazia), não renderiza nada.
  // Isto é importante para cartas como os terrenos.
  if (!cost) {
    return null;
  }

  // Usa uma expressão regular para encontrar todos os símbolos dentro de {}
  // Ex: "{2}{W}{U}" -> ["{2}", "{W}", "{U}"]
  const symbols = cost.match(/{[^}]+}/g);

  // Se não encontrar nenhum símbolo válido no formato esperado, também não renderiza nada.
  if (!symbols) {
    return null;
  }

  return (
    <span className={`inline-flex items-center align-middle gap-px ${className}`} style={{lineHeight: '1'}}>
      {symbols.map((symbolWithBraces, index) => {
        // Remove as chaves para obter o símbolo puro (ex: "{W}" -> "W")
        const symbol = symbolWithBraces.substring(1, symbolWithBraces.length - 1);
        return <ManaSymbol key={`${symbol}-${index}`} symbol={symbol} fontSize={fontSize} />;
      })}
    </span>
  );
}
