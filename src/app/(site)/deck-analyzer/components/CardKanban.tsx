import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface CardData {
  id: string;
  name: string;
  cmc: number;
  type_line: string;
  image_uris?: { normal: string };
  isLand: boolean;
  quantity: number;
}

interface CardKanbanProps {
  cards: CardData[];
}

// Tipo para as chaves das colunas
type ColumnKey = '1' | '2' | '3' | '4' | '5' | '6+' | 'Terrenos';

export default function CardKanban({ cards }: CardKanbanProps) {
  // Agrupa cartas por custo de mana
  const groupedCards: Record<ColumnKey, CardData[]> = {
    '1': cards.filter(card => !card.isLand && card.cmc === 1),
    '2': cards.filter(card => !card.isLand && card.cmc === 2),
    '3': cards.filter(card => !card.isLand && card.cmc === 3),
    '4': cards.filter(card => !card.isLand && card.cmc === 4),
    '5': cards.filter(card => !card.isLand && card.cmc === 5),
    '6+': cards.filter(card => !card.isLand && card.cmc >= 6),
    'Terrenos': cards.filter(card => card.isLand),
  };

  // Colunas do Kanban
  const columns: ColumnKey[] = ['1', '2', '3', '4', '5', '6+', 'Terrenos'];

  if (!cards.length) {
    return (
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-neutral-600" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {columns.map((column) => (
              <div key={column} className="min-w-[130px]">
                <Skeleton className="h-4 w-24 mx-auto mb-2 bg-neutral-600" />
                <Skeleton className="h-[240px] w-full bg-neutral-600" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-neutral-800 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Visualização do Deck</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div key={column} className="min-w-[130px]">
              <h3 className="text-lg font-semibold text-blue-600 mb-2 text-center">
                {column === 'Terrenos' ? 'Terrenos' : `CMC ${column}`}
              </h3>
              <div className="relative h-[600px]">
                {groupedCards[column].length === 0 ? (
                  <p className="text-neutral-400 text-center pt-4">Nenhuma carta</p>
                ) : (
                  groupedCards[column].map((card, index) => (
                    <div
                      key={card.id}
                      className="absolute w-full transition-transform duration-200 hover:scale-125 hover:z-10 hover:-translate-y-2"
                      style={{ transform: `translateY(${index * 40}px)` }}
                    >
                      <div className="relative">
                        {card.quantity > 1 && (
                          <Badge
                            className="absolute w-[20px] h-[20px] -top-2 -right-0 bg-amber-500 rounded-[20px] text-white text-[9px] font-bold z-10 flex items-center justify-center"
                          >
                            {card.quantity}
                          </Badge>
                        )}
                        {card.image_uris?.normal ? (
                          <Image
                            src={card.image_uris.normal}
                            alt={card.name}
                            width={130}
                            height={140}
                            className="w-full object-contain aspect-[5/7] rounded-md"
                            loading="lazy"
                            unoptimized
                          />
                        ) : (
                          <Skeleton className="w-full h-[240px] bg-neutral-600 flex items-center justify-center rounded-md">
                            <span className="text-neutral-400 text-sm">Sem imagem</span>
                          </Skeleton>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}