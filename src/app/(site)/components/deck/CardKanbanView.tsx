// app/components/deck/CardKanbanView.tsx
'use client'

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
//import type { ScryfallCard } from '@/app/(site)/lib/scryfall';

// Tipo de dados esperado por este componente
export interface KanbanCardData {
  id: string;
  name: string;
  cmc: number;
  type_line: string;
  image_uris?: { normal?: string };
  count: number;
}

interface CardKanbanViewProps {
  cards: KanbanCardData[];
}

// Tipo para as chaves das colunas do Kanban
type ColumnKey = '0' | '1' | '2' | '3' | '4' | '5' | '6+' | 'Terrenos';

export default function CardKanbanView({ cards }: CardKanbanViewProps) {
  // Agrupa as cartas por custo de mana (CMC)
  const groupedCards = cards.reduce((acc, card) => {
    const isLand = card.type_line.toLowerCase().includes('land');
    let key: ColumnKey = '6+'; // Chave padrão para CMC alto

    if (isLand) {
      key = 'Terrenos';
    } else if (card.cmc <= 5) {
      key = card.cmc.toString() as ColumnKey;
    }
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(card);
    return acc;
  }, {} as Record<ColumnKey, KanbanCardData[]>);

  // Define a ordem das colunas
  const columns: ColumnKey[] = ['0', '1', '2', '3', '4', '5', '6+', 'Terrenos'];

  return (
    <Card className="bg-neutral-900 border-neutral-800 p-4">
      <CardContent className="p-0">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {columns.map((columnKey) => (
            <div key={columnKey} className="min-w-[100px]">
              <h3 className="text-lg font-semibold text-amber-500 mb-3 text-center border-b border-neutral-700 pb-1">
                {columnKey === 'Terrenos' ? 'Terrenos' : `CMC ${columnKey}`}
              </h3>
              <div className="relative min-h-[400px] space-y-[-120px]"> {/* Empilhamento negativo */}
                {groupedCards[columnKey] && groupedCards[columnKey].length > 0 ? (
                  groupedCards[columnKey]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((card) => (
                      <div
                        key={card.id}
                        className="relative w-full transition-transform duration-200 hover:z-10 hover:scale-125"
                      >
                        <div className="relative">
                          {card.count > 1 && (
                            <Badge
                              className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full text-black text-xs font-bold z-20 flex items-center justify-center p-0"
                            >
                              {card.count}
                            </Badge>
                          )}
                           <Image
                              src={card.image_uris?.normal || `https://placehold.co/265x370/171717/EAB308?text=${encodeURIComponent(card.name)}`}
                              alt={card.name}
                              width={265}
                              height={370}
                              className="w-full object-contain aspect-[5/7] rounded-md shadow-lg"
                            />
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-neutral-500 text-xs text-center pt-4">Nenhuma carta</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
