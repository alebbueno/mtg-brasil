// src/app/lib/types.ts
import type { User as SupabaseUser } from '@supabase/supabase-js';
// import type { ScryfallCard } from '@/app/lib/scryfall';

// Tipos para os dados do Deck vindos da base de dados
export interface DeckCard {
  id: string;
  scryfall_id: string;
  name: string;
  image_uri?: string | null;
  count: number;
}

// Em: src/app/lib/scryfall.ts (Exemplo)

export interface ScryfallCard {
  id: string; // UUID do Scryfall
  name: string;
  mana_cost?: string;
  type_line?: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    art_crop: string;
    border_crop: string;
  };
  // ...muitos outros campos que a API do Scryfall retorna
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
  decklist: {
    mainboard: { name: string; count: number }[];
    sideboard?: { name: string; count: number }[];
  };
  is_public: boolean;
  representative_card_image_url: string | null;
  ai_analysis: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  }
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
  isInitiallySaved: boolean;
}


export interface User {
  id: string;
  name: string;
  // outras infos de usuário...
}

export interface DeckWithCardsAndUser {
  id: string;
  name: string;
  format: string;
  user: User;
  cards: DeckCard[];
}
