/* eslint-disable no-console */
/* eslint-disable no-undef */
import 'dotenv/config';
import { supabaseServiceClient } from '@/app/(site)/lib/supabase';

async function testConnection() {
  try {
    const { data, error } = await supabaseServiceClient.from('daily_decks').select('*').limit(1);
    if (error) throw error;
    console.log('Conexão bem-sucedida. Dados:', data);
  } catch (error) {
    console.error('Erro na conexão com Supabase:', error);
  }
}

testConnection();