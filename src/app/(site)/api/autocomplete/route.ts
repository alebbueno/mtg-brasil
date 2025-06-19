import { NextResponse } from 'next/server';
import { fetchAutocomplete } from '@/app/(site)/lib/scryfall';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query inválida' }, { status: 400 });
    }

    const result = await fetchAutocomplete(query);
    return NextResponse.json({ suggestions: result.data.slice(0, 5) });
  } catch (errorr) {    
    //console.error('Erro no autocomplete:', errorr);
    return NextResponse.json({ error: 'Erro ao buscar sugestões', errorr }, { status: 500 });
  }
}