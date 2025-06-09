// src/app/lib/types.ts
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { ScryfallCard } from '@/app/lib/scryfall';

// Tipos para os dados do Deck vindos da base de dados
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

// Tipo para os dados do perfil do criador
export interface CreatorProfile {
  username: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
}

// Props para o componente de visualização do cliente
export interface DeckDetailViewProps {
  initialDeck: DeckFromDB;
  initialScryfallMapArray: [string, ScryfallCard][];
  currentUser: SupabaseUser | null;
  creatorProfile: CreatorProfile | null;
}
