// app/components/home/LatestSetItem.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

// A interface SetData pode vir do seu arquivo de tipos ou lib/scryfall.ts
export interface SetData { // Certifique-se que esta interface está disponível ou importada
  name: string;
  code: string;
  iconUrl?: string;
}

interface LatestSetItemProps {
  set: SetData;
}

export default function LatestSetItem({ set }: LatestSetItemProps) {
  return (
    <Link 
      // ATUALIZADO AQUI: Navega para /collections/[setCode]
      href={`/collections/${set.code.toLowerCase()}`} 
      className="block group"
    >
      <Card className="bg-neutral-800 border-neutral-700 hover:border-amber-500 transition-all duration-300 p-4 flex items-center gap-4 h-full">
        {set.iconUrl && (
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image 
              src={set.iconUrl} 
              alt={`${set.name} icon`} 
              fill 
              sizes="40px"
              className="object-contain"
            />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-neutral-100 group-hover:text-amber-500">{set.name}</h3>
          <p className="text-sm text-neutral-400 uppercase">{set.code}</p>
        </div>
      </Card>
    </Link>
  );
}