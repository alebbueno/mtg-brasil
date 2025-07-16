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
 * @param param0 Dados do prompt: formato, instrução do usuário, nome e identidade de cor do comandante.
 * @returns Prompt formatado para a IA.
 */
export function createDeckForUserPrompt({ format, commanderName, userPrompt, commanderColorIdentity }: DeckPromptData): string {
  const instructions = userPrompt
    ? `Construa um deck de Magic: The Gathering para o formato ${format} com base na seguinte instrução: "${userPrompt}". A sinergia do deck deve girar em torno desta instrução.`
    : `Construa um deck sinérgico e eficaz para o formato ${format}.`;

  let commanderClause = '';
  if (format === 'commander') {
    if (commanderName && commanderColorIdentity) {
      commanderClause = `O deck deve ter OBRIGATORIAMENTE EXATAMENTE 99 cartas no mainboard, EXCLUINDO o comandante ${commanderName}, que deve ser especificado separadamente. Todas as cartas devem ESTRITAMENTE respeitar a identidade de cor [${commanderColorIdentity.join(', ')}]. Inclua 20-30 criaturas para garantir jogabilidade.`;
    } else {
      commanderClause = `Escolha um comandante popular que se encaixe na instrução fornecida e construa um deck com OBRIGATORIAMENTE EXATAMENTE 99 cartas no mainboard, EXCLUINDO o comandante, e ESTRITAMENTE respeitando a identidade de cor do comandante escolhido. Inclua 20-30 criaturas para garantir jogabilidade.`;
    }
  }

  return `Você é um deckbuilder especialista em Magic: The Gathering. Sua tarefa é criar um deck do zero para o formato ${format}. ${instructions} ${commanderClause} Não inclua cartas banidas no formato. O nome e a descrição do deck DEVEM ser em Português do Brasil. ${jsonOutputFormat}`;
}