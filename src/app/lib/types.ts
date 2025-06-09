// app/lib/types.ts
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { ScryfallCard } from '@/app/lib/scryfall';

// Tipos relacionados com Decks
export interface DeckCard {
  count: number;
  name: string;
}

export interface Decklist {
  mainboard: DeckCard[];
  sideboard?: DeckCard[];
}

export interface DeckFromDB {
  id: string;
  user_id: string;
  name: string;
  format: string;
  description: string | null;
  decklist: Decklist;
  is_public: boolean;
  representative_card_image_url: string | null;
}

// Tipos para as props dos componentes
export interface DeckDetailPageProps {
  params: {
    format: string;
    id: string;
  };
};

export interface DeckDetailViewProps {
  initialDeck: DeckFromDB;
  initialScryfallMapArray: [string, ScryfallCard][];
  currentUser: SupabaseUser | null;
}
