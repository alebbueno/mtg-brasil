import { NextResponse } from 'next/server';
import { fetchAutocomplete } from '@/app/lib/scryfall';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query inválida' }, { status: 400 });
    }

    const result = await fetchAutocomplete(query);
    return NextResponse.json({ suggestions: result.data.slice(0, 5) });
  } catch (error) {
    console.error('Erro no autocomplete:', error);
    return NextResponse.json({ error: 'Erro ao buscar sugestões' }, { status: 500 });
  }
}