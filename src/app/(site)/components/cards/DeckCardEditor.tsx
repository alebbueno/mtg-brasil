/* eslint-disable no-unused-vars */
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface DeckCardEditorProps {
  card: {
    id: string;
    name: string;
    image_url?: string;
    count: number;
    scryfall_id: string;
  };
  count: number;
  onChange: (newCount: number) => void;
  onRemove: () => void;
}

export default function DeckCardEditor({
  card,
  count,
  onChange,
  onRemove,
}: DeckCardEditorProps) {
  return (
    <div className="flex items-center gap-2">
      {card.image_url && (
        <Image
          src={card.image_url}
          alt={card.name}
          width={60}
          height={85}
          className="rounded shadow"
        />
      )}
      <div className="flex-1">
        <div className="font-medium">{card.name}</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onChange(count - 1)}>
            -
          </Button>
          <span>{count}</span>
          <Button variant="outline" size="sm" onClick={() => onChange(count + 1)}>
            +
          </Button>
          <Button variant="destructive" size="sm" onClick={onRemove}>
            Remover
          </Button>
        </div>
      </div>
    </div>
  );
}
