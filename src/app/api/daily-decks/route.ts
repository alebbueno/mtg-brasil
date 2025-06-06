/* eslint-disable no-console */
/* eslint-disable no-undef */
import { NextResponse } from 'next/server';
import { getDailyDecks } from '@/app/lib/daily-deck';

export async function GET() {
  try {
    console.log('Chamando getDailyDecks na API...');
    const decks = await getDailyDecks(new Date());
    console.log('Decks retornados:', JSON.stringify(decks, null, 2));
    return NextResponse.json(decks);
  } catch (error) {
    console.error('Erro na API /daily-decks:', error);
    return NextResponse.json({ error: 'Failed to fetch daily decks' }, { status: 500 });
  }
}