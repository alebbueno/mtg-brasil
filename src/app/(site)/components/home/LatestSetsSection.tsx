/* eslint-disable no-console */
/* eslint-disable no-undef */
'use client';

import LatestSetItem from './LatestSetItem';
import { Card } from '@/components/ui/card';
import { Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface SetData {
  code: string;
  name: string;
  iconUrl?: string;
}

interface LatestSetsSectionProps {
  sets: SetData[];
}

export default function LatestSetsSection({ sets }: LatestSetsSectionProps) {
  console.log('Client LatestSetsSection: Dados recebidos:', sets);

  if (!sets || sets.length === 0) return null;

  const latestThreeSets = sets.slice(0, 3);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-amber-500 flex items-center gap-3">
          <Layers />
          Últimas Coleções
        </h2>
        <Link
          href="/collections"
          className="text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors"
        >
          Ver Todas &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {latestThreeSets.map((set) => (
          <LatestSetItem key={set.code} set={set} />
        ))}

        {/* Card de Ver Todas */}
        <Link href="/collections" className="group block h-full">
          <Card
            className={cn(
              "bg-neutral-800/50 border-2 border-dashed border-neutral-700 h-full flex flex-col items-center justify-center text-center p-6",
              "transition-all duration-300 hover:border-amber-500 hover:bg-neutral-800"
            )}
          >
            <ArrowRight className="h-10 w-10 text-neutral-500 group-hover:text-amber-400 transition-colors group-hover:translate-x-1" />
            <p className="mt-4 font-semibold text-sm text-neutral-200 group-hover:text-white">
              Ver Todas as Coleções
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
