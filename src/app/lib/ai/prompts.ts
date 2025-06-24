interface PromptData {
  format: string;
  commanderName?: string | null;
  coreCardsList?: string;
  userPrompt?: string | null;
}

/**
 * Gera um prompt superdetalhado para a IA com base no formato e nas entradas do usuário.
 */
export function createDeckPrompt({ format, commanderName, coreCardsList, userPrompt }: PromptData): string {
  
  const jsonOutputFormat = 'Você DEVE responder usando apenas um objeto JSON válido, sem nenhum texto, introdução ou explicação adicional. A estrutura do JSON deve ser: { "name": "string (um nome criativo e temático para o deck)", "description": "string (uma breve descrição da estratégia do deck em 2 a 3 frases concisas.)", "decklist": { "mainboard": [{"count": number, "name": "string"}], "sideboard": [{"count": number, "name": "string"}] } }.';

  const promptCore = coreCardsList ? `O núcleo de cartas fornecido pelo usuário é este (use estas cartas como base para a estratégia):\n${coreCardsList}` : 'O usuário não forneceu cartas base, então o deck deve ser construído do zero.';
  
  const promptInstructions = userPrompt ? `A instrução principal do usuário para o deck é: "${userPrompt}". A sinergia do deck deve girar em torno desta instrução.` : 'O usuário não deu instruções específicas, então construa um arquétipo popular, sinérgico e eficaz para o formato.';

  let finalPrompt = '';

  switch (format) {
    case 'commander':
      finalPrompt = `
        Você é um deckbuilder especialista em Magic: The Gathering, focado no formato Commander. Sua tarefa é criar um deck de Commander (EDH).
        Regras Estritas a Seguir:
        1. O deck deve conter exatamente 100 cartas (comandante + 99 no grimório).
        2. O formato é singleton: apenas uma cópia de cada carta é permitida, exceto terrenos básicos.
        3. Todas as cartas devem respeitar a identidade de cor do comandante.
        4. O deck deve conter entre 36 a 39 terrenos para uma base de mana consistente.
        5. Você conhece a lista de cartas banidas no formato Commander e NÃO incluirá nenhuma carta banida.
        
        Informações do Usuário:
        - Comandante: ${commanderName}
        - ${promptCore}
        - ${promptInstructions}
        
        Output:
        ${jsonOutputFormat}`;
      break;
    
    case 'pauper':
      finalPrompt = `
        Você é um deckbuilder especialista em Magic: The Gathering, focado no formato Pauper.
        Regras Estritas a Seguir:
        1. O deck deve conter no mínimo 60 cartas no grimório principal e até 15 no sideboard.
        2. Legalidade: APENAS cartas que já foram impressas na raridade COMUM em qualquer coleção oficial são permitidas.
        3. Você conhece a lista de cartas banidas no formato Pauper e NÃO incluirá nenhuma carta banida.
        4. O deck deve ter uma curva de mana consistente e cerca de 18-22 terrenos.
        
        Informações do Usuário:
        - ${promptCore}
        - ${promptInstructions}
        
        Output:
        ${jsonOutputFormat}`;
      break;

    case 'standard':
      finalPrompt = `
        Você é um jogador de Pro Tour, especialista em construir decks do formato Standard.
        Regras Estritas a Seguir:
        1. O deck deve conter no mínimo 60 cartas no grimório principal e até 15 no sideboard.
        2. Legalidade: APENAS cartas das coleções mais recentes, atualmente válidas no formato Standard TIPO 2, são permitidas.
        3. Você conhece a lista de cartas banidas no formato Standard e NÃO incluirá nenhuma carta banida.
        4. O deck deve ter uma curva de mana consistente e cerca de 23-26 terrenos.
        
        Informações do Usuário:
        - ${promptCore}
        - ${promptInstructions}
        
        Output:
        ${jsonOutputFormat}`;
      break;

    case 'pioneer':
      finalPrompt = `
        Você é um deckbuilder veterano, especialista em construir decks do formato Pioneer.
        Regras Estritas a Seguir:
        1. O deck deve conter no mínimo 60 cartas no grimório principal e até 15 no sideboard.
        2. Legalidade: APENAS cartas a partir da coleção 'Retorno a Ravnica' em diante são permitidas.
        3. Você conhece a lista de cartas banidas no formato Pioneer e NÃO incluirá nenhuma carta banida.
        4. O deck deve ter uma curva de mana consistente e cerca de 23-25 terrenos.
        
        Informações do Usuário:
        - ${promptCore}
        - ${promptInstructions}
        
        Output:
        ${jsonOutputFormat}`;
      break;

    case 'modern':
    default:
      finalPrompt = `
        Você é um deckbuilder experiente, especialista em construir decks do formato Modern.
        Regras Estritas a Seguir:
        1. O deck deve conter no mínimo 60 cartas no grimório principal e até 15 no sideboard.
        2. Legalidade: APENAS cartas com borda moderna (a partir da 8ª Edição) são permitidas.
        3. Você conhece a lista de cartas banidas no formato Modern e NÃO incluirá nenhuma carta banida.
        4. O deck deve ter uma curva de mana consistente e cerca de 22-25 terrenos.
        
        Informações do Usuário:
        - ${promptCore}
        - ${promptInstructions}
        
        Output:
        ${jsonOutputFormat}`;
      break;
  }
  
  return finalPrompt;
}