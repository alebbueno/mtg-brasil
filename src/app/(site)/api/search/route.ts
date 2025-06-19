/* eslint-disable no-undef */
/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server';
import { fetchSearchResults, fetchFilteredSearchResults } from '@/app/lib/scryfall';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  if (!query || query.trim() === '') {
    return NextResponse.json({ error: 'Query é obrigatória' }, { status: 400 });
  }

  // Decodificar query para evitar codificação dupla
  try {
    query = decodeURIComponent(query);
  } catch (e: unknown) {
    console.error('Erro ao decodificar query:', { query, error: e instanceof Error ? e.message : 'Unknown error' });
    return NextResponse.json({ error: 'Query inválida' }, { status: 400 });
  }

  // Traduzir o termo de busca para o inglês
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seu-projeto.vercel.app';
  let translatedQuery = query;
  try {
    const translateResponse = await fetch(`${baseUrl}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: query, type: 'query' }),
    });

    if (!translateResponse.ok) {
      console.error('Erro na tradução:', {
        status: translateResponse.status,
        statusText: translateResponse.statusText,
      });
    } else {
      const { translation } = await translateResponse.json();
      translatedQuery = translation || query;
    }
  } catch (e: unknown) {
    console.error('Erro ao chamar API de tradução:', { error: e instanceof Error ? e.message : 'Unknown error' });
  }

  // Obter filtros
  const types = searchParams.get('types')?.split(',').filter(Boolean) || [];
  const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
  const rarity = searchParams.get('rarity')?.split(',').filter(Boolean) || [];
  const formats = searchParams.get('formats')?.split(',').filter(Boolean) || [];
  const set = searchParams.get('set') || '';
  const cmc = searchParams.get('cmc')?.split(',').filter(Boolean) || [];
  const artist = searchParams.get('artist') || '';

  // Validar filtros
  const validColors = ['White', 'Blue', 'Black', 'Red', 'Green', 'Colorless', 'Multicolor'];
  const validTypes = ['Creature', 'Instant', 'Sorcery', 'Land', 'Enchantment', 'Artifact', 'Planeswalker'];
  const validRarities = ['Common', 'Uncommon', 'Rare', 'Mythic'];
  const validFormats = ['Standard', 'Modern', 'Commander', 'Legacy', 'Vintage', 'Pioneer', 'Pauper'];
  const validCmc = ['1', '2', '3', '4', '5', '>5'];

  if (types.some((t) => !validTypes.includes(t))) {
    return NextResponse.json({ error: 'Tipo de carta inválido' }, { status: 400 });
  }
  if (colors.some((c) => !validColors.includes(c))) {
    return NextResponse.json({ error: 'Cor inválida' }, { status: 400 });
  }
  if (rarity.some((r) => !validRarities.includes(r))) {
    return NextResponse.json({ error: 'Raridade inválida' }, { status: 400 });
  }
  if (formats.some((f) => !validFormats.includes(f))) {
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
  }
  if (set && !/^[a-z0-9]{3,}$/.test(set)) {
    return NextResponse.json({ error: 'Código de coleção inválido' }, { status: 400 });
  }
  if (cmc.some((c) => !validCmc.includes(c))) {
    return NextResponse.json({ error: 'Valor de CMC inválido' }, { status: 400 });
  }

  // Verificar se há filtros ativos
  const hasFilters = types.length || colors.length || rarity.length || formats.length || set || cmc.length || artist;

  try {
    const result = hasFilters
      ? await fetchFilteredSearchResults(translatedQuery, { types, colors, rarity, formats, set, cmc, artist }, page)
      : await fetchSearchResults(translatedQuery, page);
    return NextResponse.json(
      {
        data: result.data,
        has_more: result.has_more,
        next_page: result.next_page,
        original_query: query,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro na rota /api/search:', {
      query,
      translatedQuery,
      types,
      colors,
      rarity,
      formats,
      set,
      cmc,
      artist,
      page,
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || 'Erro interno ao processar a busca' },
      { status: 500 }
    );
  }
}