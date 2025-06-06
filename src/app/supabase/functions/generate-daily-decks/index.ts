/* eslint-disable no-console */
/* eslint-disable no-undef */
import cron from 'node-cron';
import { getDailyDecks } from '@/app/lib/daily-deck';

cron.schedule('0 0 * * *', async () => {
  console.log('Generating daily decks...');
  try {
    await getDailyDecks(new Date());
    console.log('Daily decks generated successfully');
  } catch (error) {
    console.error('Error generating daily decks:', error);
  }
}, {
  timezone: 'America/Sao_Paulo'
});

console.log('Daily deck generation scheduler started');