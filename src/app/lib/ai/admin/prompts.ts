// --- Tipos de dados para os prompts ---

interface DecklistPromptData {
  format: string;
  userPrompt: string | null;
  commanderName?: string | null;
  commanderColorIdentity?: string[] | null;
}

interface AnalysisPromptData {
  format: string;
  decklist: string;
  deckName: string;
  deckDescription: string;
  commanderName?: string | null;
}

interface SocialPostsPromptData extends AnalysisPromptData {
  deckCheck: Record<string, any>;
}

// Define ContentPromptsData interface for use in Omit<>
interface ContentPromptsData extends AnalysisPromptData {
  deckCheck: Record<string, any>;
}

// --- Constantes de Formato de Saída ---

const jsonDeckOutputFormat = `IMPORTANTE: Você deve responder com um único objeto JSON no seguinte formato (sem nenhuma explicação ou texto extra):
{
  "name": "string (nome criativo e temático do deck, em Português do Brasil)",
  "description": "string (breve descrição da estratégia do deck, em 2-3 frases, em Português do Brasil)",
  "decklist": {
    "mainboard": [ { "count": number, "name": "string" } ],
    "sideboard": [ { "count": number, "name": "string" } ]
  }
}`;
const jsonDeckCheckOutputFormat = 'Responda APENAS com um objeto JSON com a estrutura: { "playstyle": "string", "win_condition": "string", "difficulty": "string (Fácil, Médio, ou Difícil)", "strengths": ["array de 2 a 3 pontos fortes"], "weaknesses": ["array de 2 a 3 pontos fracos"] }';
const jsonSocialOutputFormat = 'Responda APENAS com um objeto JSON com a seguinte estrutura: { "facebook": "string", "instagram": "string", "x": "string", "reddit": "string" }';

// --- Funções de Geração de Prompt ---

/**
 * Cria o prompt para a IA gerar uma DECKLIST base.
 */
export function createDecklistPrompt({ format, userPrompt, commanderName, commanderColorIdentity }: DecklistPromptData): string {
  const instructions = userPrompt
    ? `A instrução principal do usuário para o deck é: "${userPrompt}". A estratégia do deck deve girar em torno desta instrução.`
    : `Não há instrução do usuário. Crie uma estratégia sinérgica e eficaz com base nas melhores práticas do formato.`;

  switch (format) {
    case 'commander':
      return `
        Você é um deckbuilder especialista em Magic: The Gathering. Crie um deck no formato **Commander (EDH)** com base nas regras abaixo:

        1. O deck deve conter exatamente 100 cartas no total (1 comandante + 99 cartas no maindeck).
        2. O comandante é "${commanderName}".
        3. O formato é singleton: não repita nenhuma carta, exceto terrenos básicos.
        4. Todas as cartas devem respeitar a identidade de cor do comandante, que é: [${commanderColorIdentity?.join(', ') || 'N/A'}].
            - A identidade de cor é definida por todos os símbolos de mana no custo e no texto de regras do comandante.
            - **Não inclua nenhuma carta que contenha cores que não estejam nesta identidade.**
        5. Use entre 36 e 40 terrenos. Se o deck ficar com menos de 100 cartas, complete com terrenos básicos apropriados.
        6. Não use nenhuma carta banida no formato Commander.

        ${instructions}

        ${jsonDeckOutputFormat}
              `.trim();

            case 'pauper':
              return `
        Você é um deckbuilder veterano em Magic: The Gathering. Crie um deck no formato **Pauper** com base nas regras abaixo:

        1. O maindeck deve conter exatamente 60 cartas.
        2. O sideboard deve conter até 15 cartas.
        3. Todas as cartas devem ter sido impressas como **comuns** em alguma coleção oficial.
        4. Use entre 18 e 22 terrenos para uma base de mana consistente.
        5. Não use nenhuma carta banida no formato Pauper.
        6. Se o deck ficar incompleto, complete com terrenos básicos.

        ${instructions}

        ${jsonDeckOutputFormat}
              `.trim();

            case 'standard':
              return `
        Você é um jogador de Pro Tour focado no formato **Standard (T2)**. Crie um deck rigorosamente legal com base nas regras abaixo:

        1. O maindeck deve conter exatamente 60 cartas.
        2. O sideboard pode conter até 15 cartas.
        3. Use entre 22 e 26 terrenos.
        4. Apenas cartas das coleções atualmente válidas no formato Standard.
        5. Não use nenhuma carta banida no formato.
        6. Se faltar cartas, complete com terrenos básicos.

        ${instructions}

        ${jsonDeckOutputFormat}
              `.trim();

            case 'pioneer':
              return `
        Você é um deckbuilder de alto nível, especializado no formato **Pioneer**. Crie um deck com as seguintes regras:

        1. O maindeck deve conter exatamente 60 cartas.
        2. O sideboard pode conter até 15 cartas.
        3. Apenas cartas lançadas a partir de 'Return to Ravnica' são válidas.
        4. Não use nenhuma carta banida no formato Pioneer.
        5. Use entre 22 e 26 terrenos.
        6. Complete com terrenos básicos, se necessário.

        ${instructions}

        ${jsonDeckOutputFormat}
              `.trim();

            case 'modern':
            default:
              return `
        Você é um deckbuilder experiente, focado no formato **Modern**. Construa um deck seguindo estas regras:

        1. O maindeck deve conter exatamente 60 cartas.
        2. O sideboard pode conter até 15 cartas.
        3. Apenas cartas com borda moderna (8ª edição em diante) são válidas.
        4. Não use nenhuma carta banida no formato Modern.
        5. Use entre 22 e 26 terrenos.
        6. Se faltar cartas, complete com terrenos básicos.

        ${instructions}

        ${jsonDeckOutputFormat}
              `.trim();
  }
}

/**
 * Cria o prompt para a IA fazer a ANÁLISE (Deck Check).
 */
export function createDeckCheckPrompt({ decklist, format, commanderName }: AnalysisPromptData): string {
  return `Você é um jogador profissional de Magic. Analise a seguinte decklist do formato ${format} (Comandante: ${commanderName || 'N/A'}):\n${decklist}\n\nFaça uma análise técnica detalhada ("Deck Check") em Português do Brasil, cobrindo os pontos: Modo de Jogo, Rota de Vitória, Dificuldade (Fácil, Médio ou Difícil), um array com 2 a 3 Pontos Fortes, e um array com 2 a 3 Pontos Fracos. ${jsonDeckCheckOutputFormat}`;
}

/**
 * Cria o prompt para a IA gerar o GUIA DE COMO JOGAR.
 */
export function createHowToPlayGuidePrompt({ deckName, deckDescription, deckCheck }: Omit<ContentPromptsData, 'format' | 'decklist'>): string {
  const deckInfo = `Nome do Deck: ${deckName}\nDescrição: ${deckDescription}\nEstilo: ${deckCheck.playstyle}\nCondição de Vitória: ${deckCheck.win_condition}`;

  return `Você é um criador de conteúdo de Magic: The Gathering. Escreva um "Guia de Como Jogar" para o deck abaixo, em Português do Brasil. O guia deve ser amigável para jogadores intermediários.\n\n${deckInfo}\n\nEstruture o guia com as seguintes seções, usando markdown simples para títulos (ex: "### Título") e listas com marcadores (*):\n### Visão Geral da Estratégia\nExplique o plano de jogo principal em poucas frases.\n### Postura de Mulligan\nDescreva que tipo de mão inicial o jogador deve procurar e quais deve mulligar.\n### Jogo Inicial (Turnos 1-3)\nQuais são as jogadas ideais no início do jogo?\n### Meio de Jogo (Turnos 4-6)\nComo o deck começa a estabelecer sua presença na mesa?\n### Fim de Jogo (Turnos 7+)\nComo o deck finaliza a partida? Quais são os finalizadores?\n### Dicas e Sinergias\nListe 2 ou 3 interações ou sinergias importantes do deck que um jogador precisa saber.`;
}

/**
 * Cria o prompt para a IA gerar os POSTS PARA REDES SOCIAIS.
 */
export function createSocialPostsPrompt({ deckName, deckDescription, deckCheck, format }: SocialPostsPromptData): string {
  const deckCheckSummary = `- Estilo: ${deckCheck.playstyle}\n- Como Vence: ${deckCheck.win_condition}`;

  return `Você é um social media especialista em Magic: The Gathering. Baseado no deck "${deckName}" (${deckDescription}) e na análise:\n${deckCheckSummary}\n\nCrie textos em Português do Brasil com linguagem jovem e engajante, usando emojis e hashtags. No final de cada post, inclua o placeholder [LINK PARA O DECK NO SITE] para que o admin possa substituí-lo pela URL correta.\n\n- Facebook: Post com 2-3 parágrafos, explicando o estilo de jogo e convidando para ver a lista completa. Use #MagicTheGathering, #MTG, #MTGDecks, #${format}.\n- Instagram: Legenda curta e impactante para um carrossel de imagens. Foque no apelo visual e na ideia principal.\n- X (Twitter): Tweet curto (máximo 280 caracteres) com uma pergunta.\n- Reddit: Post para r/MagicBrasil, com tom mais técnico, pedindo feedback.\n\nOutput:\n${jsonSocialOutputFormat}`;
}