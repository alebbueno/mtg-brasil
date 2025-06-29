/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RecognitionResult {
  cardName?: string;
  error?: string;
}

/**
 * Recebe uma imagem de uma carta de Magic em formato Base64,
 * envia para o modelo de visão da OpenAI e retorna o nome da carta.
 */
export async function recognizeCardFromImage(imageBase64: string): Promise<RecognitionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Você precisa estar logado para usar esta função.' };
  }
  
  if (!imageBase64) {
    return { error: 'Nenhuma imagem recebida.' };
  }

  const prompt = "Você é um especialista em identificar cartas de Magic: The Gathering. Analise a imagem fornecida e retorne APENAS o nome exato da carta em inglês, sem nenhum texto adicional. Se não tiver 100% de certeza, forneça seu melhor palpite com base na arte e no layout. Se for claramente outra coisa que não uma carta de Magic (ex: uma caneta, uma carta de Pokémon), responda com 'Error: Not a Magic card'.";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                "url": imageBase64,
                "detail": "low" // Usamos 'low' para uma análise mais rápida e barata
              },
            },
          ],
        },
      ],
      max_tokens: 50,
    });

    const cardName = response.choices[0].message.content?.trim();

    // --- LOG PARA DEPURAÇÃO ---
    // Este log nos mostrará a resposta exata da IA no terminal do servidor.
    console.log("--- RESPOSTA CRUA DA IA (VISÃO) ---");
    console.log(cardName);
    console.log("-----------------------------------");


    if (!cardName || cardName.startsWith('Error:') || cardName.length > 50) {
      // Adicionamos um check de tamanho para evitar respostas muito longas e incorretas
      return { error: 'Não foi possível identificar a carta de Magic na imagem.' };
    }

    return { cardName };

  } catch (error) {
    console.error("Erro na API de Visão da OpenAI:", error);
    return { error: 'Ocorreu um erro ao analisar a imagem.' };
  }
}