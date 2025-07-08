// Tipos para os dados dos prompts
interface DeckPromptData {
  format: string;
  userPrompt: string | null;
  commanderName?: string | null;
  commanderColorIdentity?: string[] | null;
}

// O formato de saída que esperamos da IA
const jsonOutputFormat = 'Você DEVE responder usando apenas um objeto JSON válido, sem nenhum texto adicional. A estrutura do JSON deve ser: { "name": "string (nome criativo em Português do Brasil)", "description": "string (breve descrição da estratégia em Português do Brasil)", "decklist": { "mainboard": [{"count": number, "name": "string"}], "sideboard": [{"count": number, "name": "string"}] } }.';

/**
 * Cria o prompt para o gerador PÚBLICO de decks.
 */
export function createDeckForUserPrompt({ format, commanderName, userPrompt, commanderColorIdentity }: DeckPromptData): string {
  
  const instructions = userPrompt ? `A instrução principal do usuário é: "${userPrompt}". A sinergia do deck deve girar em torno desta instrução.` : `Construa um arquétipo popular, sinérgico e eficaz para o formato ${format}.`;

  let rules = '';
  switch (format) {
    case 'commander':
      rules = `Regras: O deck é do formato Commander. Deve conter 100 cartas singleton (exceto terrenos básicos). ${commanderName ? `O Comandante é ${commanderName} e a identidade de cor é [${commanderColorIdentity?.join(', ')}].` : 'O usuário não especificou um comandante, então escolha um comandante popular que se encaixe na instrução.'} Inclua 36-40 terrenos.`;
      break;
    default: // Modern, Standard, Pioneer, Pauper
      rules = `Regras: O deck é do formato ${format}. Deve conter 60 cartas no maindeck, até 15 no sideboard, e no máximo 4 cópias de cada carta. Inclua uma base de mana apropriada.`;
      break;
  }
  
  return `Você é um deckbuilder especialista em Magic: The Gathering. Sua tarefa é criar um deck do zero. ${instructions}. ${rules} Não inclua cartas banidas no formato. O nome e a descrição do deck DEVEM ser em Português do Brasil. ${jsonOutputFormat}`;
}

