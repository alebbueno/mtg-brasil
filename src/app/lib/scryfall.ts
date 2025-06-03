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
