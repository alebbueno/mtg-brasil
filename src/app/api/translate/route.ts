import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto inválido' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `
            Você é um tradutor especializado em cartas de Magic: The Gathering. Traduza o texto para o português brasileiro, mantendo termos técnicos do jogo (ex: "Channel", "Tap", "Discard", "Creature", "Instant") em inglês e preservando a formatação de símbolos de mana (ex: {1}{G}). Não modifique os símbolos de mana. Se a tradução for incerta, mantenha o termo original.

            Texto:
            ${text}
          `,
        },
      ],
      model: 'gpt-4o', // Usar gpt-4o para melhor qualidade
      temperature: 0.3, // Menor temperatura para traduções precisas
    });

    const translation = completion.choices[0].message.content;

    if (!translation) {
      return NextResponse.json({ error: 'Nenhuma tradução retornada' }, { status: 500 });
    }

    return NextResponse.json({ translation });
  } catch (errorr) {
    //console.error('Erro na tradução:', error);
    return NextResponse.json({ error: 'Erro ao traduzir o texto', errorr }, { status: 500 });
  }
}