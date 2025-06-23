/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import { checkUserRole } from '@/lib/auth';
import OpenAI from 'openai';

// Inicializa o cliente da OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TranslationResult {
  translatedText?: string;
  error?: string;
}

/**
 * Traduz o texto de uma carta de Magic usando a OpenAI API, com cache no banco de dados.
 */
export async function translateCardText(
  cardId: string, 
  cardName: string,
  cardText: string
): Promise<TranslationResult> {
  if (!cardId || !cardText) {
    return { error: 'Dados da carta insuficientes para tradução.' };
  }

  const supabase = createClient();
  
  // 1. Verifica se a tradução já existe no nosso banco de dados (cache)
  const { data: cachedTranslation } = await supabase
    .from('card_translations')
    .select('translated_text')
    .eq('card_scryfall_id', cardId)
    .single();

  if (cachedTranslation) {
    return { translatedText: cachedTranslation.translated_text };
  }
  
  // 2. Se não estiver no cache, chama a API da OpenAI
  // Apenas admins podem gerar novas traduções para controlar custos
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    return { error: "Apenas administradores podem gerar novas traduções." };
  }

  const prompt = `
    Você é um tradutor especializado em cartas de Magic: The Gathering. Traduza o texto para o português brasileiro, mantendo termos técnicos do jogo (ex: "Channel", "Tap", "Discard", "Creature", "Instant") em inglês e preservando a formatação de símbolos de mana (ex: {1}{G}). Não modifique os símbolos de mana. Se a tradução for incerta, mantenha o termo original.

    Texto:
    ${cardText}
  `;
  

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const translatedText = completion.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      return { error: "A IA não conseguiu gerar uma tradução." };
    }

    // 3. Salva a nova tradução no nosso banco de dados para uso futuro
    const { error: insertError } = await supabase
      .from('card_translations')
      .insert({ card_scryfall_id: cardId, translated_text: translatedText });
      
    if (insertError) {
      console.error("Erro ao salvar tradução no cache:", insertError);
      // Retorna a tradução mesmo que o cache falhe
    }

    return { translatedText };

  } catch (error) {
    console.error("Erro na API da OpenAI:", error);
    return { error: "Ocorreu um erro ao comunicar com a IA." };
  }
}