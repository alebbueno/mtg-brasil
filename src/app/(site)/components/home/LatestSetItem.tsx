/* eslint-disable no-console */
/* eslint-disable no-undef */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SetData } from './LatestSetsSection';

interface LatestSetItemProps {
  set: SetData;
}

export default function LatestSetItem({ set }: LatestSetItemProps) {
    console.log('LatestSetItem renderizando:', {
    code: set.code,
    name: set.name,
    iconUrl: set.iconUrl,
  });

  return (
    <Link
      href={`/collections/${set.code.toLowerCase()}`}
      className="group block h-full"
    >
      <Card
        className={cn(
          "bg-neutral-800 border-neutral-700 h-full flex flex-col items-center justify-center text-center",
          "p-6 transition-all duration-300 hover:border-amber-500 hover:bg-neutral-800"
        )}
      >
        {set.iconUrl ? (
          <div className="relative w-16 h-16 mb-4">
            <Image
              src={set.iconUrl}
              alt={`${set.name} icon`}
              fill
              sizes="64px"
              className="object-contain filter invert brightness-150"
            />

          </div>
        ) : (
          <p className="text-neutral-500 text-xs">Sem ícone</p>
        )}

        <h3 className="text-base md:text-lg font-semibold text-neutral-100 group-hover:text-amber-500 transition-colors">
          {set.name}
        </h3>
        <p className="text-xs text-neutral-500 uppercase mt-1">
          {set.code}
        </p>
      </Card>
    </Link>
  );
}
