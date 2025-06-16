/* eslint-disable no-console */
/* eslint-disable no-undef */
// Este é um SCRIPT, não uma página ou API route.
// Ele é feito para ser executado manualmente ou por um agendador (Cron Job).

import { createClient } from '@/app/utils/supabase/client'; // Adapte o caminho se necessário
import { getLigamagicPrice } from '@/app/lib/scraping'; // Importa nossa função

// Função para introduzir um atraso e não sobrecarregar o site
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const supabase = createClient();

  // 1. Busca os nomes de todas as cartas distintas que você tem no seu sistema
  // Esta é uma query de exemplo, adapte para sua estrutura.
  const { data: decks, error: decksError } = await supabase
    .from('decks')
    .select('decklist');

  if (decksError) {
    console.error("Erro ao buscar decks:", decksError);
    return;
  }
  
  // Cria uma lista única de todos os nomes de cartas
  const allCardNames = new Set<string>();
  decks.forEach(deck => {
    deck.decklist.mainboard.forEach((card: { name: string }) => allCardNames.add(card.name));
    deck.decklist.sideboard?.forEach((card: { name: string }) => allCardNames.add(card.name));
  });

  console.log(`Encontradas ${allCardNames.size} cartas únicas para atualizar...`);

  // 2. Itera sobre cada nome de carta e busca o preço
  for (const cardName of allCardNames) {
    const result = await getLigamagicPrice(cardName);

    if (result.price !== null) {
      // 3. Salva o preço no seu banco de dados (na tabela `card_prices`)
      const { error: upsertError } = await supabase
        .from('card_prices')
        .upsert({ 
          card_name: cardName, // Supondo que você use o nome como ID
          price_brl: result.price,
          source: 'ligamagic_min',
          last_updated_at: new Date().toISOString(),
        }, { onConflict: 'card_name' }); // 'upsert' atualiza se já existir, senão insere

      if (upsertError) {
        console.error(`Erro ao salvar preço para ${cardName}:`, upsertError.message);
      } else {
        console.log(`Preço de ${cardName} salvo com sucesso: R$ ${result.price}`);
      }
    }
    
    // 4. ESPERA ANTES DA PRÓXIMA REQUISIÇÃO!
    // Espera entre 2 a 5 segundos para ser um "bom cidadão".
    const waitTime = Math.random() * 3000 + 2000;
    console.log(`Aguardando ${Math.round(waitTime / 1000)}s...`);
    await delay(waitTime);
  }

  console.log("Atualização de preços concluída!");
}

main();