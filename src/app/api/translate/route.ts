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
    let model = 'gpt-4o-mini';
    let temperature = 0.3;

    if (type === 'query') {
      // Tradução de termos de busca para o texto da carta
      prompt = `
        Você é um tradutor especializado em Magic: The Gathering. Traduza o termo de busca do português brasileiro para o inglês, focando em termos que aparecem no texto de regras das cartas (oracle text), como habilidades ou efeitos (ex: "Descarte" → "Discard", "Voar" → "Flying", "Fogo" → "Fire"). Para termos compostos, traduza cada palavra separadamente (ex: "Criatura Voadora" → "Creature Flying"). Forneça apenas a tradução, sem explicações. Se o termo for ambíguo, escolha o mais comum no contexto de Magic.

        Termo:
        ${text}
      `;
    } else {
      // Tradução de textos de cartas
      prompt = `
        Você é um tradutor especializado em cartas de Magic: The Gathering. Traduza o texto para o português brasileiro, mantendo termos técnicos do jogo (ex: "Channel", "Tap", "Discard", "Creature", "Instant") em inglês e preservando a formatação de símbolos de mana (ex: {1}{G}). Não modifique os símbolos de mana. Se a tradução for incerta, mantenha o termo original.

        Texto:
        ${text}
      `;
      model = 'gpt-4o';
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model,
      temperature,
    });

    const translation = completion.choices[0]?.message?.content?.trim();
    if (!translation) {
      return NextResponse.json({ error: 'Nenhuma tradução retornada' }, { status: 500 });
    }

    return NextResponse.json({ translation });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.error('Erro na tradução:', error);
    return NextResponse.json({ error: 'Erro ao traduzir o texto' }, { status: 500 });
  }
}