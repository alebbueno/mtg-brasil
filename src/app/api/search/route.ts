import { NextResponse } from 'next/server';
import { fetchSearchResults } from '@/app/lib/scryfall';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    const page = url.searchParams.get('page') || '1';

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query inválida' }, { status: 400 });
    }

    // Traduzir o termo de busca para o inglês
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seu-projeto.vercel.app';
    const translateResponse = await fetch(`${baseUrl}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: query, type: 'query' }),
    });

    if (!translateResponse.ok) {
      // eslint-disable-next-line no-undef, no-console
      console.error('Erro na tradução:', translateResponse.status, translateResponse.statusText);
      return NextResponse.json({ error: 'Erro ao traduzir a busca' }, { status: 500 });
    }

    const { translation } = await translateResponse.json();
    const translatedQuery = translation || query; // Fallback para o termo original

    // Buscar resultados no Scryfall com o termo traduzido
    const results = await fetchSearchResults(translatedQuery, parseInt(page, 10));
    return NextResponse.json({
      data: results.data,
      has_more: results.has_more,
      next_page: results.next_page,
      original_query: query, // Retorna o termo original para exibição
    });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.error('Erro na busca:', error);
    return NextResponse.json({ error: 'Erro ao realizar a busca' }, { status: 500 });
  }
}