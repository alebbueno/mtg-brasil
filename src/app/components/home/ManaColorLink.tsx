// app/components/home/ManaColorLink.tsx
'use client';

import Link from 'next/link';

interface ManaColorLinkProps {
  symbol: string;
  name: string;
  gradient: string; // Classes de gradiente do Tailwind CSS
}

export default function ManaColorLink({ symbol, name, gradient }: ManaColorLinkProps) {
  // Gera a classe correta do mana-font a partir do símbolo
  // ex: 'W' -> 'ms-w', 'U' -> 'ms-u', etc.
  const manaClass = `ms ms-${symbol.toLowerCase()} ms-5x`;

  return (
    <Link href={`/search?colors=${symbol}`} className="block group">
      <div 
        className={`relative flex flex-col items-center justify-center p-6 aspect-square rounded-xl border border-neutral-800 overflow-hidden transition-all duration-300 hover:border-amber-400 hover:shadow-2xl hover:-translate-y-1`}
      >
        {/* Fundo com Gradiente */}
        <div className={`absolute inset-0 ${gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
        
        {/* Ícone de Mana da biblioteca mana-font */}
        <i className={`${manaClass} text-white/80 group-hover:text-white transition-colors drop-shadow-lg`} />
        
        {/* Nome da Cor */}
        <span className="mt-2 text-base font-semibold text-neutral-200">{name}</span>
      </div>
    </Link>
  );
}
