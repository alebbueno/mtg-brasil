/* eslint-disable no-undef */
// app/api/translate/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializa o cliente da OpenAI com a sua chave de API
// Certifique-se de que a variável de ambiente OPENAI_API_KEY está configurada
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Esta função irá lidar com as requisições POST para esta rota
export async function POST(req: Request) {
  try {
    // Extrai o texto e o tipo da requisição
    const { text, type = 'text' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto inválido ou em falta.' }, { status: 400 });
    }

    let prompt;
    let model = 'gpt-4o-mini'; // Modelo mais rápido e económico, ideal para esta tarefa
    let temperature = 0.1; // Baixa temperatura para traduções mais diretas e consistentes

    if (type === 'query') {
      // Prompt especializado para traduzir nomes de cartas de PT-BR para EN
      prompt = `
        You are a translation expert for the Magic: The Gathering card game. 
        Your task is to translate a card name from Brazilian Portuguese to its official English name.
        - If the input is "Anel Solar", the output must be exactly "Sol Ring".
        - If the input is "Raio", the output must be exactly "Lightning Bolt".
        - If the input is a name that is already in English, return the name as is.
        - Provide only the translated English name and nothing else. No explanations, no quotes, no extra text.

        Portuguese term: "${text}"
        English name:
      `;
    } else {
      // O seu outro prompt para tradução de textos de regras pode permanecer aqui, se necessário
      prompt = `
        Translate the following Magic: The Gathering rules text to Brazilian Portuguese, keeping technical game terms (like "Tap", "Discard", "Creature") in English and preserving mana symbols (like {1}{G}).

        Text to translate:
        ${text}
      `;
      model = 'gpt-4o'; // Um modelo mais robusto para textos completos
      temperature = 0.3;
    }

    // Chama a API da OpenAI para obter a tradução
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: model,
      temperature: temperature,
    });

    const translation = completion.choices[0]?.message?.content?.trim();

    if (!translation) {
      return NextResponse.json({ error: 'A IA não retornou uma tradução.' }, { status: 500 });
    }

    // Retorna a tradução com sucesso
    return NextResponse.json({ translation });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro na API de tradução:', error);
    return NextResponse.json({ error: 'Ocorreu um erro interno ao traduzir o texto.' }, { status: 500 });
  }
}
