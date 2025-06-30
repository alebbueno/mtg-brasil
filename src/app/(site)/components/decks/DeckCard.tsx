import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Swords } from 'lucide-react';

// Tipagem para os dados que o card espera receber
type DeckCardProps = {
  deck: {
    id: string;
    name: string;
    format: string;
    representative_card_image_url: string | null;
    color_identity: string[];
  };
};

export default function DeckCard({ deck }: DeckCardProps) {
  // Gera um gradiente sutil com base na identidade de cor do deck
  const colorStops = deck.color_identity.length > 0
    ? deck.color_identity.map(color => `var(--mana-${color.toLowerCase()})`).join(', ')
    : 'var(--mana-c)'; // Cor para decks incolores
  const gradientStyle = {
    backgroundImage: `radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent), linear-gradient(to bottom right, ${colorStops})`,
  };

  return (
    <Link href={`/my-deck/${deck.format}/${deck.id}`} className="group block">
      <Card 
        className="bg-neutral-900 border-neutral-800 h-full overflow-hidden transition-all duration-300 
                   hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-900/30 hover:-translate-y-1"
      >
        {/* Imagem de Capa do Deck */}
        <div className="relative w-full aspect-[16/9]" style={gradientStyle}>
          {deck.representative_card_image_url && (
            <Image
              src={deck.representative_card_image_url}
              alt={`Arte do deck ${deck.name}`}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        </div>
        
        {/* Informações do Deck */}
        <div className="p-4">
          <Badge variant="secondary" className="capitalize">{deck.format}</Badge>
          <h3 className="mt-2 font-bold text-lg text-neutral-100 group-hover:text-amber-400 transition-colors line-clamp-2">
            {deck.name}
          </h3>
        </div>
      </Card>
    </Link>
  );
}