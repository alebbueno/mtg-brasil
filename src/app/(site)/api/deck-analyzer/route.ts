/* eslint-disable no-console */
/* eslint-disable no-undef */
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Função para analisar decks usando OpenAI
async function analyzeDeck(decklist: string[], format: string) {
  try {
    if (!decklist || !Array.isArray(decklist) || decklist.length === 0) {
      throw new Error('Lista de deck inválida');
    }
    if (!format || typeof format !== 'string') {
      throw new Error('Formato inválido');
    }

    // Normaliza a lista de deck
    const cardNames = decklist.map(line => line.replace(/^\d+\s+/, '').trim()).join('\n');

    let prompt;
    const model = 'gpt-4o-mini';
    const temperature = 0.3;

    if (format === 'commander') {
      prompt = `
        Você é um especialista em Magic: The Gathering, com foco no formato Commander. Analise o deck fornecido com base no sistema de Commander Brackets (1 a 5, onde 1 é pré-construído e 5 é cEDH). Considere os seguintes critérios:
        - Velocidade: Quão rápido o deck pode vencer (ex.: turno médio de vitória).
        - Consistência: Presença de tutores, staples (ex.: Sol Ring, Cyclonic Rift), e redundância.
        - Interatividade: Remoções (ex.: Swords to Plowshares) e controle (ex.: Counterspell).
        - Game Changers: Combos infinitos (ex.: Thassa’s Oracle + Demonic Consultation) ou cartas poderosas (ex.: Mana Crypt).
        Retorne um JSON com:
        - bracket: Número de 1 a 5.
        - explanation: Explicação da análise (em português brasileiro).
        - strengths: Lista de pontos fortes (máximo 3, em português).
        - weaknesses: Lista de pontos fracos (máximo 3, em português).
        - suggestions: Lista de até 3 sugestões de melhorias (ex.: adicionar cartas específicas, ajustar curva de mana, em português).

        Deck:
        ${cardNames}
      `;
    } else {
      prompt = `
        Você é um especialista em Magic: The Gathering, com foco no formato ${format}. Analise o deck fornecido com base em:
        - Curva de mana: Eficiência para o meta do formato (ex.: baixa para aggro, equilibrada para controle).
        - Sinergia: Coerência entre cartas (ex.: triggers, arquétipos como tribal ou Combo).
        - Meta-Relevância: Presença de staples do formato (ex.: Fatal Push em Modern, Bonecrusher Giant em Standard).
        Retorne um JSON com:
        - powerLevel: "Casual", "Intermediário" ou "Competitivo".
        - explanation: Explicação da análise (em português brasileiro).
        - strengths: Lista de pontos fortes (máximo 3, em português).
        - weaknesses: Lista de pontos fracos (máximo 3, em português).
        - suggestions: Lista de até 3 sugestões de melhorias (ex.: adicionar cartas específicas, ajustar estratégia, em português).

        Deck:
        ${cardNames}
      `;
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model,
      temperature,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    if (!result || (!result.bracket && !result.powerLevel)) {
      throw new Error('Análise inválida retornada pela IA');
    }

    return result;
  } catch (error) {
    console.error('Erro ao analisar deck com OpenAI:', error);
    throw error;
  }
}

// Handler POST para análise de deck
export async function POST(req: NextRequest) {
  try {
    const { decklist, format } = await req.json();

    if (!decklist || !Array.isArray(decklist) || decklist.length === 0) {
      return NextResponse.json({ error: 'Lista de deck inválida' }, { status: 400 });
    }
    if (!format || typeof format !== 'string') {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
    }

    const analysis = await analyzeDeck(decklist, format);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro na API de Análise de Deck:', error);
    return NextResponse.json({ error: 'Erro interno ao analisar o deck' }, { status: 500 });
  }
}