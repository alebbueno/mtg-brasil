// app/components/home/ManaColorLink.tsx
import Link from 'next/link';
import React from 'react';

interface ManaColorLinkProps {
  color: string;
  name: string;
  bgColor: string;
  textColor: string;
  symbolChar: string;
}

export default function ManaColorLink({ color, name, bgColor, textColor, symbolChar }: ManaColorLinkProps) {
  return (
    // Removido legacyBehavior e a tag <a> interna.
    // As classes foram para o Link, que passará para o div filho.
    <Link 
      href={`/search?colors=${color.toUpperCase()}`} 
      className={`p-4 rounded-lg border border-neutral-700 hover:border-amber-500 transition flex flex-col items-center justify-center aspect-square ${bgColor} ${textColor} hover:shadow-lg group`}
    >
      {/* O conteúdo que estava na tag <a> agora é filho direto do Link */}
      <span className="text-4xl font-bold group-hover:scale-110 transition-transform">{symbolChar}</span>
      <span className="mt-1 text-sm font-semibold">{name}</span>
    </Link>
  );
}