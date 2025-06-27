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

const jsonDeckOutputFormat = 'Você DEVE responder usando apenas um objeto JSON válido, sem nenhum texto adicional. A estrutura do JSON deve ser: { "name": "string (nome criativo e temático para o deck em Português do Brasil)", "description": "string (breve descrição da estratégia em Português do Brasil)", "decklist": { "mainboard": [{"count": number, "name": "string"}], "sideboard": [{"count": number, "name": "string"}] } }.';
const jsonDeckCheckOutputFormat = 'Responda APENAS com um objeto JSON com a estrutura: { "playstyle": "string", "win_condition": "string", "difficulty": "string (Fácil, Médio, ou Difícil)", "strengths": ["array de 2 a 3 pontos fortes"], "weaknesses": ["array de 2 a 3 pontos fracos"] }';
const jsonSocialOutputFormat = 'Responda APENAS com um objeto JSON com a seguinte estrutura: { "facebook": "string", "instagram": "string", "x": "string", "reddit": "string" }';

// --- Funções de Geração de Prompt ---

/**
 * Cria o prompt para a IA gerar uma DECKLIST base.
 */
export function createDecklistPrompt({ format, userPrompt, commanderName, commanderColorIdentity }: DecklistPromptData): string {
  const instructions = `A instrução principal do usuário para o deck é: "${userPrompt}". A sinergia e a escolha das cartas devem girar em torno desta instrução.`;
  let rules = '';

  switch (format) {
    case 'commander':
      rules = `O Comandante é ${commanderName}. Regras a seguir: 100 cartas no total (99 + comandante), formato singleton, respeite a identidade de cor [${commanderColorIdentity?.join(', ')}], inclua 36-40 terrenos.`;
      break;
    case 'pauper':
      rules = `Regras a seguir: 60 cartas no maindeck, 15 no sideboard, apenas cartas de raridade COMUM. Inclua 18-22 terrenos.`
      break;
    default:
      rules = `Regras a seguir: 60 cartas no maindeck, 15 no sideboard, até 4 cópias de cada. Inclua 22-25 terrenos.`
      break;
  }
  
  return `Você é um deckbuilder especialista em Magic: The Gathering. Crie um deck do zero para o formato ${format}. ${instructions}. ${rules} Não inclua cartas banidas no formato. ${jsonDeckOutputFormat}`;
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