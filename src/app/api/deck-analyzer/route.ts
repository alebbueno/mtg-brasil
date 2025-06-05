/* eslint-disable no-console */
/* eslint-disable no-undef */
import { NextRequest, NextResponse } from 'next/server';
import { fetchCardsByNames } from '@/app/lib/scryfall';
import { analyzeDeck } from '../translate/route';

interface DeckAnalysisRequest {
  decklist: string[];
  format: string;
}

export async function POST(req: NextRequest) {
  try {
    const { decklist, format }: DeckAnalysisRequest = await req.json();
    if (!decklist || !Array.isArray(decklist) || decklist.length === 0) {
      return NextResponse.json({ error: 'Lista de deck inválida' }, { status: 400 });
    }
    if (!format || typeof format !== 'string') {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
    }

    // Normaliza a lista de deck
    const cardNames = decklist.map(line => line.replace(/^\d+\s+/, '').trim());

    // Busca dados de legalidade
    const cards = await fetchCardsByNames(cardNames);

    // Verifica legalidade no formato
    const illegalCards = cards.filter(card => card.legalities[format] !== 'legal');
    if (illegalCards.length > 0) {
      return NextResponse.json({
        error: `As seguintes cartas não são legais em ${format.toLowerCase()}: ${illegalCards.map(c => c.name).join(', ')}`,
      }, { status: 400 });
    }

    // Analisa o deck com OpenAI
    const analysis = await analyzeDeck(decklist, format);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro ao analisar deck:', error);
    return NextResponse.json({ error: 'Erro ao analisar deck' }, { status: 500 });
  }
}