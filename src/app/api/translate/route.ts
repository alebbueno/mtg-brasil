/* eslint-disable no-undef */
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, type = 'text' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto inválido' }, { status: 400 });
    }

    let prompt;
    let model = 'gpt-4o-mini'; // Pode usar um modelo mais rápido/barato para tradução de termos simples
    let temperature = 0.1; // Baixa temperatura para traduções mais diretas

    if (type === 'query') {
      // ... (seu prompt PT-BR para EN - sem alterações) ...
      prompt = `
        Você é um tradutor especializado em Magic: The Gathering. Traduza o termo de busca do português brasileiro para o inglês, focando em termos que aparecem no texto de regras das cartas (oracle text), como habilidades ou efeitos (ex: "Descarte" → "Discard", "Voar" → "Flying", "Fogo" → "Fire"). Para termos compostos, traduza cada palavra separadamente (ex: "Criatura Voadora" → "Creature Flying"). Forneça apenas a tradução, sem explicações. Se o termo for ambíguo, escolha o mais comum no contexto de Magic.

        Termo:
        ${text}
      `;
    } else if (type === 'keyword_en_to_pt') { // NOVO TIPO ADICIONADO
      prompt = `
        Você é um tradutor especializado em Magic: The Gathering. Traduza a seguinte palavra-chave ou termo de regra do Magic do Inglês para seu equivalente mais comum e reconhecido em Português do Brasil usado pela comunidade de jogadores. 
        Se for um termo que geralmente é mantido em inglês pela comunidade brasileira (ex: "Scry", "Phyrexian Mana"), retorne o termo em inglês mesmo.
        Forneça apenas o termo traduzido (ou o original se for o caso), sem nenhuma explicação adicional, sem aspas e sem pontuação final. Por exemplo, se o input for "Flying", a resposta deve ser apenas "Voar". Se o input for "Deathtouch", a resposta deve ser "Toque Mortífero".

        Termo em Inglês:
        ${text}
      `;
      // model = 'gpt-3.5-turbo'; // Considere um modelo mais rápido/barato se disponível e adequado
    } else { // (type === 'text' - seu default para tradução de textos de carta)
      prompt = `
        Você é um tradutor especializado em cartas de Magic: The Gathering. Traduza o texto para o português brasileiro, mantendo termos técnicos do jogo (ex: "Channel", "Tap", "Discard", "Creature", "Instant") em inglês e preservando a formatação de símbolos de mana (ex: {1}{G}). Não modifique os símbolos de mana. Se a tradução for incerta, mantenha o termo original.

        Texto:
        ${text}
      `;
      model = 'gpt-4o'; // Modelo mais robusto para texto completo
      temperature = 0.3;
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model,
      temperature,
    });

    const translation = completion.choices[0]?.message?.content?.trim();
    if (!translation) {
      return NextResponse.json({ error: 'Nenhuma tradução retornada pela IA' }, { status: 500 });
    }

    return NextResponse.json({ translation });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro na API de Tradução:', error);
    return NextResponse.json({ error: 'Erro interno ao traduzir o texto' }, { status: 500 });
  }
}