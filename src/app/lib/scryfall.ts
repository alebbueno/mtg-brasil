/* eslint-disable no-undef */
/* eslint-disable no-console */
// app/lib/scryfall.ts (ou onde seu arquivo estiver localizado)

// Funções existentes que você forneceu:
export async function fetchCardById(id: string): Promise<any> {
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

export async function fetchCardByName(name: string, exact: boolean = true): Promise<any> {
  if (!name || typeof name !== 'string') {
    throw new Error('Nome da carta inválido');
  }
  
  const param = exact ? 'exact' : 'fuzzy';
  const res = await fetch(`https://api.scryfall.com/cards/named?${param}=${encodeURIComponent(name)}`);
  if (!res.ok) {
    throw new Error(`Erro ao buscar carta: ${res.status} - ${res.statusText}`);
  }
  return res.json();
}

export async function fetchSearchResults(
  query: string,
  page: number = 1
): Promise<{ data: any[]; has_more: boolean; next_page?: string }> {
  if (!query || typeof query !== 'string') {
    throw new Error('Query de busca inválida');
  }

  // A query original era o:"${query}", o que busca no texto oracle.
  // Se a intenção é uma busca mais geral, pode ser apenas q=${encodeURIComponent(query)}
  // Vou manter como estava, mas é um ponto de atenção dependendo do comportamento desejado.
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
    cmc?: string[]; // Considerar se cmc pode ser número ou string para operadores como >5
    artist?: string;
  },
  page: number = 1
): Promise<{ data: any[]; has_more: boolean; next_page?: string }> {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    // Permitir query vazia se houver filtros, ou tratar como erro?
    // Se a query é a parte principal, como oracle:"${query}", então ela não deve ser vazia.
    // Se a query pode ser apenas filtros, então a lógica de construção da scryfallQuery precisa mudar.
    // Por ora, mantendo a obrigatoriedade da query principal.
    throw new Error('Query de busca inválida');
  }

  let scryfallQuery = `oracle:"${query}"`; // Ou apenas a query se ela já incluir sintaxe Scryfall

  if (filters.types?.length) {
    scryfallQuery += ` ${filters.types.map((t) => `t:${t.toLowerCase()}`).join(' ')}`;
  }
  if (filters.colors?.length) {
    const colorMap: Record<string, string> = {
      White: 'W', Blue: 'U', Black: 'B', Red: 'R', Green: 'G',
      Colorless: 'C', Multicolor: 'M',
    };
    // Se os filtros de cores já vêm como 'W', 'U', etc., o map não é necessário.
    // Assumindo que vêm como nomes completos por enquanto.
    const colorCodes = filters.colors
      .map((c) => colorMap[c] || c) // Usa o código mapeado ou o próprio valor se não estiver no map
      .filter((c) => c)
      .join('');
    if (colorCodes) {
      // Scryfall espera `c:WUBRG` (cores exatas) ou `c<=WUBRG` (subset), `c>=W` (at least)
      // A query `c:WUB` busca cartas que são exatamente Branco, Azul E Preto.
      // Se a intenção for OU (Branco OU Azul), a sintaxe é `(c:W or c:U)`
      // Para "pelo menos estas cores, podendo ter mais", use `id:${colorCodes}` ou `color>=${colorCodes}`
      // Para "exatamente estas cores e nenhuma outra", use `c!${colorCodes}` ou `color=${colorCodes}`
      // A query `c:${colorCodes}` (sem operador) geralmente significa identidade de cor (commander identity).
      // Para cores na carta (casting cost), é `mana:${colorCodes}`.
      // Vamos assumir que `c:` se refere à identidade de cor e que o usuário quer cartas que *incluam* essas cores.
      // A sintaxe mais comum para "cartas que são dessas cores" é `color=${colorCodes}` para exato ou `color<=${colorCodes}` para combinação.
      // Se for para identidade de comandante, `id:${colorCodes}`.
      // Por simplicidade, `c:${colorCodes}` é um bom começo, mas pode precisar de ajuste fino.
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
    scryfallQuery += ` e:${filters.set.toLowerCase()}`; // Códigos de set geralmente são minúsculos
  }
  if (filters.cmc?.length) {
    // A lógica atual `cmc=${cmc}` ou `cmc>5` parece boa.
    // Scryfall também aceita `cmc<X`, `cmc<=X`, `cmc>=X`, `cmc!=X`.
    const cmcQueries = filters.cmc.map((cmc) => (cmc.startsWith('>') || cmc.startsWith('<') || cmc.startsWith('=') || cmc.startsWith('!=')) ? `cmc${cmc}` : `cmc=${cmc}`);
    scryfallQuery += ` (${cmcQueries.join(' or ')})`;
  }
  if (filters.artist) {
    scryfallQuery += ` a:"${filters.artist}"`; // Aspas são boas para nomes de artistas com espaços
  }

  console.log('Scryfall Query (Filtrada):', scryfallQuery); // Log para depuração

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout de 10 segundos
    const res = await fetch(
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(scryfallQuery)}&page=${page}`,
      {
        headers: {
          'Cache-Control': 'public, max-age=3600', // Cache de 1 hora
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.status === 404) { // Nenhuma carta encontrada
      return {
        data: [],
        has_more: false,
        next_page: undefined,
      };
    }

    if (!res.ok) {
      let errorData: { message?: string, details?: string, warnings?: string[] } = {}; // Scryfall pode retornar 'details' ou 'warnings'
      try {
        errorData = await res.json();
      } catch (e) {
        console.error('Erro ao parsear JSON da resposta de erro do Scryfall:', e);
      }
      interface ScryfallError extends Error {
        status?: number;
        scryfallDetails?: string;
        scryfallWarnings?: string[];
      }
      const errorMessage = errorData.details || errorData.message || res.statusText;
      const error = new Error(
        `Erro na busca filtrada do Scryfall: ${res.status} - ${errorMessage}`
      ) as ScryfallError;
      error.status = res.status;
      error.scryfallDetails = errorData.details;
      error.scryfallWarnings = errorData.warnings;
      throw error;
    }

    const result = await res.json();
    return {
      data: result.data || [],
      has_more: result.has_more || false,
      next_page: result.next_page,
    };
  } catch (error: any) {
    // Se o erro já for uma instância de Error com status, não sobrescreva.
    if (error.status) throw error;

    console.error('Exceção em fetchFilteredSearchResults:', {
      query, // query original do usuário
      scryfallQuery, // query montada para Scryfall
      filters,
      page,
      errorMessage: error.message,
    });
    // Re-throw o erro original para ser tratado por quem chamou a função
    throw new Error(`Falha na requisição para Scryfall: ${error.message}`);
  }
}


// --- Nova função e interfaces para buscar coleções ---

// Interface para o objeto de Set da Scryfall API
export interface ScryfallSet {
  object: 'set';
  id: string;
  code: string;
  name: string;
  uri: string;
  scryfall_uri: string;
  search_uri: string;
  released_at: string;
  set_type: string;
  card_count: number;
  parent_set_code?: string;
  digital: boolean;
  nonfoil_only: boolean;
  foil_only: boolean;
  block_code?: string;
  block?: string;
  icon_svg_uri: string;
}

// Interface genérica para respostas de lista da Scryfall API
export interface ScryfallApiListResponse<T> {
  object: 'list';
  has_more: boolean;
  data: T[];
  next_page?: string;
  total_cards?: number;
  warnings?: string[];
}

// Interface para os dados da coleção que nossos componentes esperam
export interface SetData {
  name: string;
  code: string;
  iconUrl?: string;
}

const SIMPLIFIED_VALID_SET_TYPES = ['expansion', 'core', 'masters']; // Lista bem reduzida para teste

export async function fetchLatestSets(count: number = 3): Promise<SetData[]> {
  console.log("fetchLatestSets: Iniciando busca...");
  try {
    const response = await fetch("https://api.scryfall.com/sets");
    console.log("fetchLatestSets: Resposta da API recebida, status:", response.status);

    if (!response.ok) {
      let errorBodyText = "N/A";
      try {
        errorBodyText = await response.text(); // Tenta pegar o corpo como texto para depuração
      } catch (e) { /* ignora */ }
      console.error("fetchLatestSets: Erro na API Scryfall. Status:", response.status, "Corpo:", errorBodyText);
      throw new Error(`Scryfall API error (sets): ${response.status} ${response.statusText}`);
    }
    
    const result: ScryfallApiListResponse<ScryfallSet> = await response.json();
    console.log("fetchLatestSets: JSON parseado. Total de sets recebidos (antes do filtro):", result.data?.length);

    if (!result.data || !Array.isArray(result.data)) {
      console.error("fetchLatestSets: result.data não é um array ou está indefinido.");
      return [];
    }

    const filteredSets = result.data.filter(set => {
      const isDigital = set.digital;
      const isValidType = SIMPLIFIED_VALID_SET_TYPES.includes(set.set_type);
      const isReleased = new Date(set.released_at) <= new Date();
      // console.log(`Set: ${set.code}, Digital: ${isDigital}, Type: ${set.set_type} (Valido: ${isValidType}), Released: ${set.released_at} (OK: ${isReleased})`);
      return !isDigital && isValidType && isReleased;
    });
    console.log("fetchLatestSets: Sets após filtro:", filteredSets.length);
    
    const latestValidSets = filteredSets
      .slice(0, count)
      .map(set => ({
        name: set.name,
        code: set.code,
        iconUrl: set.icon_svg_uri,
      }));
    
    console.log("fetchLatestSets: Sets processados para retornar:", latestValidSets.length);
    return latestValidSets;

  } catch (error: any) {
    console.error("fetchLatestSets: Exceção capturada:", error.message, error.stack);
    return []; 
  }
}

// Você pode adicionar mais funções aqui conforme necessário.