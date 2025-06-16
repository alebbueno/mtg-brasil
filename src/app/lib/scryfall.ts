/* eslint-disable no-undef */
/* eslint-disable no-console */
// app/lib/scryfall.ts

// --- INTERFACE PRINCIPAL PARA CARTAS ---
// Esta interface define a estrutura de dados de uma carta da API Scryfall.
export interface ScryfallCard {
  collector_number: any;
  set: any;
  id: string;
  name: string;
  printed_name?: string; // Nome impresso na carta (pode ser em português)
  lang: string;
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

/**
 * Busca os dados completos de uma carta pelo seu ID do Scryfall.
 * @param scryfallId - O UUID da carta no Scryfall.
 * @returns Um objeto ScryfallCard completo ou null.
 */
export async function fetchCardById(scryfallId: string): Promise<ScryfallCard | null> {
  if (!scryfallId) return null;

  try {
    const url = `https://api.scryfall.com/cards/${scryfallId}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Scryfall API error for ID "${scryfallId}": ${response.statusText}`);
      return null;
    }

    const cardData: ScryfallCard = await response.json();
    return cardData;

  } catch (error) {
    console.error(`Failed to fetch card by ID "${scryfallId}" from Scryfall:`, error);
    return null;
  }
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


// Em app/lib/scryfall.ts
export async function searchCards(query: string, filters: { type_line?: string } = {}) {
  const params = new URLSearchParams({ q: `${query} ${filters.type_line || ''}` });
  const response = await fetch(`https://api.scryfall.com/cards/search?${params}`);
  return response.json();
}

// Agrupa cartas por tipo de linha (type_line)
export function groupCardsByType(cards: (ScryfallCard & { count: number })[]) {
  return cards.reduce<Record<string, (ScryfallCard & { count: number })[]>>((acc, card) => {
    const typeKey = extractCardTypes(card.type_line || "Outros");
    if (!acc[typeKey]) acc[typeKey] = [];
    acc[typeKey].push(card);
    return acc;
  }, {});
}

// Extrai o tipo primário da carta para agrupamento
function extractCardTypes(typeLine: string): string {
  const parts = typeLine.split("—")[0].trim().split(" ");
  const types = ["Creature", "Instant", "Sorcery", "Enchantment", "Artifact", "Land", "Planeswalker", "Battle"];
  return types.find(t => parts.includes(t)) || "Outros";
}

// Simula atualização do nome do deck (você pode adaptar para Supabase, localStorage, etc.)
export async function updateDeckName(deckId: string, newName: string): Promise<void> {
  // Simulação: no app real, você poderia salvar no Supabase, Firestore ou outro backend
  console.log(`Atualizando nome do deck ${deckId} para "${newName}"`);
  return new Promise((resolve) => setTimeout(resolve, 300)); // Simula atraso
}

/**
 * Busca por cartas na API do Scryfall usando o endpoint de busca geral.
 * Retorna uma lista de objetos de carta completos.
 */

export async function fetchAutocompleteNames(query: string): Promise<string[]> {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Erro na busca de autocomplete do Scryfall:", error);
    return [];
  }
}

/**
 * FUNÇÃO ATUALIZADA: Agora busca com uma query mais flexível.
 */
export async function searchScryfallCards(query: string): Promise<ScryfallCard[]> {
  if (!query || query.length < 2) {
    return [];
  }

  // A query agora espera termos exatos, que vamos construir no frontend
  const params = new URLSearchParams({
    q: query,
    unique: 'cards',
  });

  try {
    const response = await fetch(`https://api.scryfall.com/cards/search?${params.toString()}`);
    if (!response.ok) {
      if (response.status === 404) return [];
      const errorDetails = await response.json().catch(() => ({}));
      console.error('Scryfall search API error:', errorDetails);
      return [];
    }
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Falha ao buscar cartas no Scryfall:", error);
    return [];
  }
}


/**
 * Busca os dados de uma única carta, incluindo o preço em USD, da API do Scryfall.
 * @param cardName - O nome exato da carta.
 * @returns O preço em USD ou null se não for encontrado.
 */
export async function getCardPriceFromScryfall(cardName: string): Promise<number | null> {
  if (!cardName) return null;

  try {
    // A API do Scryfall tem um endpoint para buscar pelo nome exato
    const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      // Se a carta não for encontrada (404) ou houver outro erro, retorna null
      console.error(`Scryfall API error for "${cardName}": ${response.statusText}`);
      return null;
    }

    const cardData = await response.json();

    // O objeto de preços pode ter vários valores (usd, usd_foil, eur, etc.)
    // Vamos pegar o preço normal em USD como referência.
    const priceUsd = cardData?.prices?.usd;

    if (priceUsd) {
      return parseFloat(priceUsd);
    }

    return null; // Retorna null se não houver preço em USD

  } catch (error) {
    console.error(`Failed to fetch price for "${cardName}" from Scryfall:`, error);
    return null;
  }
}
