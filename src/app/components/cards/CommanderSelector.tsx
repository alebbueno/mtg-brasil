/* eslint-disable no-unused-vars */
import { useState } from "react";
import { searchCards } from "@/app/lib/scryfall";
import type { ScryfallCard } from "@/app/lib/scryfall"; // Corrigido aqui
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CommanderSelectorProps {
  commander?: {
    name: string;
    image_url?: string;
  } | null;
  onSelect: (card: ScryfallCard) => void;
}

export default function CommanderSelector({ commander, onSelect }: CommanderSelectorProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const cards = await searchCards(`${query} is:commander`);
    setResults(cards);
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">Comandante</h2>
      {commander && (
        <div className="flex items-center gap-2">
          {commander.image_url && (
            <img src={commander.image_url} alt={commander.name} className="w-16 rounded" />
          )}
          <span>{commander.name}</span>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Buscar comandante"
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
            onClick={() => onSelect(card)}
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
