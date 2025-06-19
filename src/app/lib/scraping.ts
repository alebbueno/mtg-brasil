/* eslint-disable no-console */
/* eslint-disable no-undef */
import puppeteer from 'puppeteer';

// Interface para o retorno da função
interface PriceResult {
  price: number | null;
  error?: string;
}

/**
 * Busca o menor preço de uma carta na Ligamagic usando Puppeteer.
 * @param cardName - O nome da carta a ser buscada.
 * @returns Um objeto com o preço ou uma mensagem de erro.
 */
export async function getLigamagicPrice(cardName: string): Promise<PriceResult> {
  let browser;
  try {
    console.log(`Iniciando busca de preço para: ${cardName}`);
    
    // 1. Inicia o navegador Puppeteer
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // 2. Abre uma nova página
    const page = await browser.newPage();

    // 3. Navega para a URL da carta na Ligamagic
    const formattedCardName = encodeURIComponent(cardName);
    const url = `https://www.ligamagic.com.br/?view=cards/card&card=${formattedCardName}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log(`Página carregada: ${url}`);

    // AJUSTE CRÍTICO: Este é o novo seletor, baseado no HTML que você forneceu.
    // Ele busca pela div com classe "price" dentro da div com classe "min".
    const priceSelector = '.price-mkp .min .price'; 
    
    // 4. Espera o seletor do preço mínimo aparecer na página
    await page.waitForSelector(priceSelector, { timeout: 10000 });

    // 5. Extrai o texto do elemento do preço
    const priceText = await page.$eval(priceSelector, el => el.textContent);

    if (!priceText) {
      throw new Error('Não foi possível encontrar o texto do preço.');
    }

    console.log(`Texto do preço extraído: "${priceText}"`);

    // 6. Limpa e formata o texto para obter um número (esta lógica já está correta para "R$ 12,34")
    const cleanedPrice = priceText
      .replace('R$', '')
      .replace('.', '')
      .replace(',', '.')
      .trim();
    
    const price = parseFloat(cleanedPrice);

    if (isNaN(price)) {
      throw new Error('O texto do preço extraído não é um número válido.');
    }

    console.log(`Preço final: ${price}`);

    return { price };

  } catch (err: any) {
    console.error(`Erro ao buscar preço para "${cardName}":`, err.message);
    return { price: null, error: err.message };
  } finally {
    // 7. Garante que o navegador seja sempre fechado
    if (browser) {
      await browser.close();
    }
  }
}