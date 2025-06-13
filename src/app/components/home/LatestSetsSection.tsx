/* eslint-disable react/no-unknown-property */
// app/components/home/LatestSetsSection.tsx
'use client' // Converte para um Componente de Cliente para permitir a interatividade

import { useRef } from 'react';
import LatestSetItem, { type SetData } from './LatestSetItem';
import { Button } from '@/components/ui/button';
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface LatestSetsSectionProps {
  sets: SetData[]; // A página deve passar umas 12 coleções para isto
}

export default function LatestSetsSection({ sets }: LatestSetsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!sets || sets.length === 0) {
    return null;
  }

  // Função para controlar o scroll do carrossel
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      // Calcula uma quantidade de scroll que parece natural (aprox. 3/4 da largura visível)
      const scrollAmount = current.offsetWidth * 0.75; 
      current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <>
      {/* Adiciona o estilo para esconder a scrollbar visualmente */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      <section className="py-16 sm:py-20 bg-neutral-900">
        <div className="container mx-auto px-4">
          {/* Cabeçalho da Secção com os botões de navegação */}
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-amber-500 flex items-center gap-3">
              <Layers />
              Últimas Coleções
            </h2>
            <div className="flex items-center gap-4">
              <Link href="/collections" className="text-sm text-amber-500 hover:text-amber-500 transition-colors">
                Ver Todas &rarr;
              </Link>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => scroll('left')}
                  className="border-neutral-600 hover:bg-neutral-800 disabled:opacity-30 rounded-full h-8 w-8"
                  aria-label="Scroll para a esquerda"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => scroll('right')}
                  className="border-neutral-600 hover:bg-neutral-800 disabled:opacity-30 rounded-full h-8 w-8"
                  aria-label="Scroll para a direita"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Container do Carrossel com scroll horizontal */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
          >
            {sets.map(set => (
              // Define a largura de cada item para que ~5 sejam visíveis em telas grandes
              <div key={set.code} className="flex-shrink-0 w-full max-w-[240px] sm:w-[calc(100%/3-1rem)] md:w-[calc(100%/4-1rem)] lg:w-[calc(100%/5-0.8rem)]">
                 <LatestSetItem set={set} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
