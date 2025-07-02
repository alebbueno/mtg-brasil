import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProfileDeckFiltersProps {
  availableFormats: string[];
  activeFormat: string | null;
  slug: string;
}

export default function ProfileDeckFilters({ availableFormats, activeFormat, slug }: ProfileDeckFiltersProps) {
  // Mostrar o componente se houver pelo menos 1 formato
  if (availableFormats.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      <h3 className="text-sm font-semibold text-neutral-400 mr-2">Filtrar por formato:</h3>

      <Link href={`/profile/${slug}`}>
        <Button
          variant={!activeFormat ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
        >
          Todos
        </Button>
      </Link>

      {availableFormats.map(format => (
        <Link href={`/profile/${slug}?format=${format.toLowerCase()}`} key={format}>
          <Button
            variant={activeFormat === format.toLowerCase() ? 'default' : 'outline'}
            size="sm"
            className="rounded-full capitalize"
          >
            {format}
          </Button>
        </Link>
      ))}
    </div>
  );
}
