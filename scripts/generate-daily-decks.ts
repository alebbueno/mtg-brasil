/* eslint-disable no-console */
/* eslint-disable no-undef */
import 'dotenv/config';
import cron from 'node-cron';
import { getDailyDecks } from '@/app/lib/daily-deck';

cron.schedule('0 0 * * *', async () => {
  console.log('Gerando decks diários...');
  try {
    await getDailyDecks(new Date());
    console.log('Decks diários gerados com sucesso');
  } catch (error) {
    console.error('Erro ao gerar decks diários:', error);
  }
}, {
  timezone: 'America/Sao_Paulo'
});

console.log('Agendador de geração de decks diários iniciado');