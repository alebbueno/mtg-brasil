/* eslint-disable no-console */
/* eslint-disable no-undef */
import 'dotenv/config';
import { getDailyDecks } from '@/app/lib/daily-deck';
import { format } from 'date-fns';

async function runDailyDecksManual() {
  const today = new Date();
  const dateStr = format(today, 'yyyy-MM-dd');
  console.log(`Iniciando geração manual de decks para ${dateStr}...`);

  try {
    const decks = await getDailyDecks(today);
    console.log('Decks gerados com sucesso:', JSON.stringify(decks, null, 2));

    // Buscar decks salvos no Supabase para confirmar
    const { supabaseServiceClient } = await import('@/app/lib/supabase');
    const { data: savedDecks, error } = await supabaseServiceClient
      .from('daily_decks')
      .select('*')
      .eq('date', dateStr);

    if (error) {
      console.error('Erro ao buscar decks salvos:', error);
      return;
    }

    console.log('Decks salvos no Supabase:', JSON.stringify(savedDecks, null, 2));
  } catch (error) {
    console.error('Erro durante a geração manual:', error);
  }
}

runDailyDecksManual();