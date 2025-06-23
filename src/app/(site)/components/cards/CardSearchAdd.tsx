/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchCards } from "@/app/lib/scryfall";
import type { ScryfallCard } from '@/app/lib/types';  // Corrigido aqui

interface CardSearchAddProps {
  onAddCard: (card: ScryfallCard) => void;
}

export default function CardSearchAdd({ onAddCard }: CardSearchAddProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const cards = await searchCards(query);
    setResults(cards);
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar carta..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={loading}>
          Buscar
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {results.map((card) => (
          <button
            key={card.id}
            onClick={() => onAddCard(card)}
            className="text-left border rounded p-2 hover:bg-muted"
          >
            <div className="font-medium">{card.name}</div>
            {card.image_uris?.small && (
              <img
                src={card.image_uris.small}
                alt={card.name}
                className="w-full mt-1 rounded"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
