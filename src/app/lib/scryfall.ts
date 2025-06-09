/* eslint-disable no-undef */
/* eslint-disable no-console */
// app/lib/scryfall.ts

// --- INTERFACE PRINCIPAL PARA CARTAS ---
// Esta interface define a estrutura de dados de uma carta da API Scryfall.
export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_identity: string[];
  rarity: string;
  set_name: string;
  legalities: {
    standard: string;
    modern: string;
    pauper: string;
    commander: string;
    legacy: string;
    vintage: string;
    pioneer: string;
    [key: string]: string;
  };
  prices: { // Campo adicionado para corrigir o erro de build
    usd: string | null;
    usd_foil: string | null;
    eur: string | null;
    eur_foil: string | null;
    tix: string | null;
  };
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    art_crop: string;
    border_crop: string;
  };
  // Adicione outros campos que precisar aqui
}


// --- Funções para buscar dados no Scryfall ---

export async function fetchCardById(id: string): Promise<ScryfallCard> {
  if (!id || typeof id !== 'string') {
    throw new Error('ID da carta inválido');
  }
  const res = await fetch(`https://api.scryfall.com/cards/${id}`);
  if (!res.ok) {
    throw new Error(`Erro ao buscar carta: ${res.status} - ${res.statusText}`);
  }
  return res.json();
}

export async function fetchAutocomplete(query: string): Promise<{ data: string[] }> {
  if (!query || typeof query !== 'string') {
    throw new Error('Query de autocomplete inválida');
  }
  const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error(`Erro no autocomplete: ${res.status} - ${res.statusText}`);
  }
  return res.json();
}

export async function fetchCardByName(name: string, exact: boolean = true): Promise<ScryfallCard> {
  if (!name || typeof name !== 'string') {
    throw new Error('Nome da carta inválido');
  }
  
  const param = exact ? 'exact' : 'fuzzy';
  const res = await fetch(`https://api.scryfall.com/cards/named?${param}=${encodeURIComponent(name)}`);
  if (!res.ok) {
    throw new Error(`Erro ao buscar carta por nome: ${res.status} - ${res.statusText}`);
  }
  return res.json();
}

export async function fetchSearchResults(
  query: string,
  page: number = 1
): Promise<{ data: ScryfallCard[]; has_more: boolean; next_page?: string }> {
  if (!query || typeof query !== 'string') {
    throw new Error('Query de busca inválida');
  }

  const formattedQuery = `o:"${query}"`;

  const res = await fetch(
    `https://api.scryfall.com/cards/search?q=${encodeURIComponent(formattedQuery)}&page=${page}`
  );

  if (!res.ok) {
    throw new Error(`Erro na busca: ${res.status} - ${res.statusText}`);
  }

  return res.json();
}

export async function fetchFilteredSearchResults(
  query: string,
  filters: {
    types?: string[];
    colors?: string[];
    rarity?: string[];
    formats?: string[];
    set?: string;
    cmc?: string[];
    artist?: string;
  },
  page: number = 1
): Promise<{ data: ScryfallCard[]; has_more: boolean; next_page?: string }> {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    throw new Error('Query de busca inválida');
  }

  let scryfallQuery = `oracle:"${query}"`; 
  
  if (filters.types?.length) {
    scryfallQuery += ` ${filters.types.map((t) => `t:${t.toLowerCase()}`).join(' ')}`;
  }
  if (filters.colors?.length) {
    const colorMap: Record<string, string> = {
      White: 'W', Blue: 'U', Black: 'B', Red: 'R', Green: 'G',
      Colorless: 'C', Multicolor: 'M',
    };
    const colorCodes = filters.colors
      .map((c) => colorMap[c] || c)
      .filter((c) => c)
      .join('');
    if (colorCodes) {
      scryfallQuery += ` c:${colorCodes}`;
    }
  }
  if (filters.rarity?.length) {
    scryfallQuery += ` ${filters.rarity.map((r) => `r:${r.toLowerCase()}`).join(' ')}`;
  }
  if (filters.formats?.length) {
    scryfallQuery += ` ${filters.formats.map((f) => `f:${f.toLowerCase()}`).join(' ')}`;
  }
  if (filters.set) {
    scryfallQuery += ` e:${filters.set.toLowerCase()}`;
  }
  if (filters.cmc?.length) {
    const cmcQueries = filters.cmc.map((cmc) => (cmc.startsWith('>') || cmc.startsWith('<') || cmc.startsWith('=') || cmc.startsWith('!=')) ? `cmc${cmc}` : `cmc=${cmc}`);
    scryfallQuery += ` (${cmcQueries.join(' or ')})`;
  }
  if (filters.artist) {
    scryfallQuery += ` a:"${filters.artist}"`;
  }

  try {
    const res = await fetch(
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(scryfallQuery)}&page=${page}`
    );

    if (res.status === 404) {
      return { data: [], has_more: false, next_page: undefined };
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Erro na busca filtrada do Scryfall: ${res.status} - ${errorData.details || res.statusText}`);
    }

    const result = await res.json();
    return {
      data: result.data || [],
      has_more: result.has_more || false,
      next_page: result.next_page,
    };
  } catch (error: any) {
    console.error('Exceção em fetchFilteredSearchResults:', error);
    throw new Error(`Falha na requisição para Scryfall: ${error.message}`);
  }
}

// --- Funções para buscar coleções e cartas em lote ---

export interface ScryfallSet {
  object: 'set';
  id: string;
  code: string;
  name: string;
  released_at: string;
  set_type: string;
  icon_svg_uri: string;
  digital: boolean;
}

export interface ScryfallApiListResponse<T> {
  object: 'list';
  has_more: boolean;
  data: T[];
}

export interface SetData {
  name: string;
  code: string;
  iconUrl?: string;
}

const VALID_SET_TYPES = ['expansion', 'core', 'masters', 'draft_innovation', 'commander'];

export async function fetchLatestSets(count: number = 5): Promise<SetData[]> {
  try {
    const response = await fetch("https://api.scryfall.com/sets");
    if (!response.ok) {
      throw new Error(`Erro na API Scryfall (sets): ${response.statusText}`);
    }
    
    const result: ScryfallApiListResponse<ScryfallSet> = await response.json();
    const latestValidSets = result.data
      .filter(set => !set.digital && VALID_SET_TYPES.includes(set.set_type) && new Date(set.released_at) <= new Date())
      .slice(0, count)
      .map(set => ({
        name: set.name,
        code: set.code,
        iconUrl: set.icon_svg_uri,
      }));
      
    return latestValidSets;
  } catch (error: any) {
    console.error("Falha ao buscar últimas coleções:", error);
    return []; 
  }
}

export async function fetchCardsByNames(names: string[]): Promise<ScryfallCard[]> {
  if (!names || !Array.isArray(names) || names.length === 0) {
    return [];
  }

  const batches = [];
  for (let i = 0; i < names.length; i += 75) {
    batches.push(names.slice(i, i + 75));
  }

  const results: ScryfallCard[] = [];
  for (const batch of batches) {
    try {
        const res = await fetch('https://api.scryfall.com/cards/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifiers: batch.map(name => ({ name })) }),
        });
        if (!res.ok) {
            console.error(`Erro ao buscar lote de cartas: ${res.status} - ${await res.text()}`);
            continue;
        }
        const { data } = await res.json();
        if (data) {
            results.push(...data);
        }
    } catch(error) {
        console.error('Erro na requisição do lote de cartas:', error);
    }
  }

  return results;
}
