'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';


const FORMATS = ['Commander', 'Standard', 'Pioneer', 'Modern', 'Pauper'];

export default function DeckFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const activeFormat = searchParams.get('format');

  const handleFilter = (format: string | null) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reseta para a primeira página ao filtrar

    if (format) {
      params.set('format', format.toLowerCase());
    } else {
      params.delete('format');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <Button 
            onClick={() => handleFilter(null)}
            variant={!activeFormat ? 'default' : 'outline'}
            className="rounded-full"
        >
            Todos
        </Button>
      {FORMATS.map(format => (
        <Button
          key={format}
          onClick={() => handleFilter(format)}
          variant={activeFormat === format.toLowerCase() ? 'default' : 'outline'}
          className="rounded-full"
        >
          {format}
        </Button>
      ))}
    </div>
  );
}