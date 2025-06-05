// app/components/home/LatestSetsSection.tsx
import LatestSetItem, { SetData } from './LatestSetItem';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface LatestSetsSectionProps {
  sets: SetData[];
}

export default function LatestSetsSection({ sets }: LatestSetsSectionProps) {
  if (!sets || sets.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-amber-400 mb-8">Últimas Coleções</h2>
      <div className="space-y-4">
        {sets.map(set => (
          <LatestSetItem key={set.code} set={set} />
        ))}
      </div>
      <div className="text-left mt-8">
        <Link href="/collections">
          <Button variant="outline" className="text-amber-400 border-amber-400 hover:bg-amber-400 hover:text-black">
            Ver Todas Coleções
          </Button>
        </Link>
      </div>
    </div>
  );
}