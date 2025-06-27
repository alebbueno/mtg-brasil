// src/app/lib/types.ts
import type { User as SupabaseUser } from '@supabase/supabase-js';
// import type { ScryfallCard } from '@/app/(site)/lib/scryfall';

// Tipos para os dados do Deck vindos da base de dados
export interface DeckCard {
  id: string;
  scryfall_id: string;
  name: string;
  image_uri?: string | null;
  count: number;
}

// Em: src/app/lib/scryfall.ts (Exemplo)


// A definição completa e única para uma carta do Scryfall
export interface ScryfallCard {
  card_faces: boolean;
  id: string;
  name: string;
  oracle_id: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;
  highres_image: boolean;
  image_status: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  colors?: string[];
  color_identity: string[];
  keywords: string[];
  legalities: Record<string, string>;
  games: string[];
  reserved: boolean;
  foil: boolean;
  nonfoil: boolean;
  finishes: string[];
  oversized: boolean;
  promo: boolean;
  reprint: boolean;
  variation: boolean;
  set_id: string;
  set: string;
  set_name: string;
  set_type: string;
  set_uri: string;
  set_search_uri: string;
  scryfall_set_uri: string;
  rulings_uri: string;
  prints_search_uri: string;
  collector_number: string;
  digital: boolean;
  rarity: string;
  flavor_text?: string;
  card_back_id: string;
  artist: string;
  artist_ids: string[];
  illustration_id: string;
  border_color: string;
  frame: string;
  full_art: boolean;
  textless: boolean;
  booster: boolean;
  story_spotlight: boolean;
  edhrec_rank?: number;
  prices: {
    usd: string | null;
    usd_foil: string | null;
    usd_etched: string | null;
    eur: string | null;
    eur_foil: string | null;
    tix: string | null;
  };
  // E qualquer outro campo que você precise
}

export interface Decklist {
  mainboard: DeckCard[];
  sideboard?: DeckCard[];
}

export interface DeckFromDB {
  social_posts: any;
  how_to_play_guide: string;
  deck_check: any;
  id: string;
  user_id: string;
  name: string;
  format: string;
  description: string | null;
  decklist: {
    commander: any[];
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
