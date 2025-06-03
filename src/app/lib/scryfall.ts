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

  const formattedQuery = `o:"${query}"`; // Buscar no texto da carta

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
  },
  page: number = 1
): Promise<{ data: any[]; has_more: boolean; next_page?: string }> {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    throw new Error('Query de busca inválida');
  }

  // Construir query Scryfall
  let scryfallQuery = `oracle:"${query}"`;

  if (filters.types?.length) {
    scryfallQuery += ` ${filters.types.map((t) => `t:${t.toLowerCase()}`).join(' ')}`;
  }
  if (filters.colors?.length) {
    const colorMap: Record<string, string> = {
      White: 'W',
      Blue: 'U',
      Black: 'B',
      Red: 'R',
      Green: 'G',
      Colorless: 'C',
      Multicolor: 'M',
    };
    const colorCodes = filters.colors
      .map((c) => colorMap[c])
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
    scryfallQuery += ` e:${filters.set}`;
  }

  try {
    const controller = new AbortController();
    // eslint-disable-next-line no-undef
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout de 10 segundos
    const res = await fetch(
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(scryfallQuery)}&page=${page}`,
      {
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
        signal: controller.signal,
      }
    );
    // eslint-disable-next-line no-undef
    clearTimeout(timeoutId);

    if (res.status === 404) {
      // Scryfall retorna 404 quando não há resultados
      return {
        data: [],
        has_more: false,
        next_page: undefined,
      };
    }

    if (!res.ok) {
      let errorData: { message?: string } = {};
      try {
        errorData = await res.json();
      } catch (e) {
        // eslint-disable-next-line no-undef, no-console
        console.error('Erro ao parsear resposta de erro do Scryfall:', e);
      }
      interface ScryfallError extends Error {
        response?: { message?: string };
      }
      const error = new Error(
        `Erro na busca filtrada do Scryfall: ${res.status} - ${errorData.message || res.statusText}`
      ) as ScryfallError;
      error.response = errorData;
      throw error;
    }

    const result = await res.json();
    return {
      data: result.data || [],
      has_more: result.has_more || false,
      next_page: result.next_page,
    };
  } catch (error: any) {
    // eslint-disable-next-line no-undef, no-console
    console.error('Erro em fetchFilteredSearchResults:', {
      query,
      scryfallQuery,
      filters,
      page,
      error: error.message,
      response: error.response || 'Nenhuma resposta',
    });
    throw error;
  }
}